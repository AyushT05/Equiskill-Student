"use client"
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import Script from 'next/script';
import { EQUISKILL_LOGO_B64 } from './_logoBase64';

// ---------------------------------------------------------------------------
// Wikipedia image fetcher
// ---------------------------------------------------------------------------
const SKIP_URL_PATTERNS = [
    'Flag_of', 'Commons-logo', 'Wikidata', 'Question_book', 'Wiki_letter',
    'Nuvola', 'Portal-', 'Crystal_', 'OOjs', 'Ambox', 'Disambig',
    'Text_document', 'Edit-clear', 'Gnome-', 'Oxygen480',
];

async function fetchWikipediaImage(searchQuery) {
    try {
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&format=json&origin=*&srlimit=1`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();
        const pageTitle = searchData?.query?.search?.[0]?.title;
        if (!pageTitle) return null;

        const imageUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=pageimages&pithumbsize=800&format=json&origin=*`;
        const imageRes = await fetch(imageUrl);
        const imageData = await imageRes.json();
        const pages = imageData?.query?.pages;
        const page = pages ? Object.values(pages)[0] : null;
        const thumb = page?.thumbnail?.source ?? '';

        if (!thumb) return null;
        if (SKIP_URL_PATTERNS.some(p => thumb.includes(p))) return null;

        return { url: thumb, title: pageTitle };
    } catch {
        return null;
    }
}

function extractWikiSearchTerms(html) {
    const matches = [...html.matchAll(/<h3[^>]*data-wiki-search="([^"]*)"[^>]*>(.*?)<\/h3>/gi)];
    return matches.map(m => ({
        heading: m[2].replace(/<[^>]+>/g, '').trim(),
        searchQuery: m[1].trim(),
    })).filter(({ searchQuery }) => Boolean(searchQuery));
}

function injectImages(html, imageMap) {
    return html.replace(/<h3([^>]*)>(.*?)<\/h3>/gi, (match, attrs, inner) => {
        const heading = inner.replace(/<[^>]+>/g, '').trim();
        const img = imageMap[heading];
        if (!img) return match;
        return `${match}
<figure style="
  display:flex;
  flex-direction:column;
  align-items:center;
  margin:1.5rem auto;
">
  <img
    src="${img.url}"
    alt="${img.title}"
    style="max-width:100%;max-height:380px;object-fit:contain;border-radius:0.75rem;border:1px solid #e2e8f0;padding:0.5rem;background:#f8fafc;display:inline-block;"
    loading="lazy"
  />
  <figcaption style="margin-top:0.5rem;font-size:0.8rem;color:#64748b;font-style:italic;">
    ${img.title} — via Wikipedia
  </figcaption>
</figure>`;
    });
}

// ---------------------------------------------------------------------------
// KaTeX rendering helper — runs after dangerouslySetInnerHTML update
// ---------------------------------------------------------------------------
function renderKatexInContainer(container) {
    if (!container || typeof window === 'undefined' || !window.katex) return;
    // Render \(...\) and \[...\]
    if (window.renderMathInElement) {
        try {
            window.renderMathInElement(container, {
                delimiters: [
                    { left: '\\(', right: '\\)', display: false },
                    { left: '\\[', right: '\\]', display: true },
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false },
                ],
                throwOnError: false,
            });
        } catch (e) {
            // silently ignore KaTeX errors
        }
    }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
function ViewNotes() {
    const { courseId } = useParams();
    const router = useRouter();
    const [Notes, setNotes] = useState([]);
    const [stepCount, setStepCount] = useState(0);
    const [direction, setDirection] = useState(1);
    const [downloading, setDownloading] = useState(false);
    const [imageCache, setImageCache] = useState({});
    const [loadingImages, setLoadingImages] = useState(false);
    const [katexReady, setKatexReady] = useState(false);
    const fetchedChapters = useRef(new Set());
    const noteContentRef = useRef(null);

    useEffect(() => { GetNotes(); }, []);

    // Re-render KaTeX whenever the displayed note changes or KaTeX loads
    useEffect(() => {
        if (katexReady && noteContentRef.current) {
            renderKatexInContainer(noteContentRef.current);
        }
    }, [stepCount, Notes, imageCache, katexReady]);

    useEffect(() => {
        if (!Notes.length || stepCount >= Notes.length) return;
        const note = Notes[stepCount];
        const key = note?.chapterId ?? stepCount;
        if (fetchedChapters.current.has(key)) return;
        fetchedChapters.current.add(key);
        fetchImagesForChapter(key, note?.notes ?? '');
    }, [stepCount, Notes]);

    const GetNotes = async () => {
        try {
            const result = await axios.post('/api/study-type', {
                studyType: 'notes',
                courseId: courseId,
            });
            const uniqueNotes = Array.from(
                new Map(
                    (result?.data || []).map(note => [
                        note.chapterId,
                        note
                    ])
                ).values()
            ).sort((a, b) => a.chapterId - b.chapterId);

            setNotes(uniqueNotes);
        } catch (error) {
            console.error("Error fetching notes:", error);
            setNotes([]);
        }
    };

    const fetchImagesForChapter = async (chapterKey, html) => {
        const terms = extractWikiSearchTerms(html);
        if (!terms.length) return;

        setLoadingImages(true);
        const results = await Promise.all(
            terms.map(async ({ heading, searchQuery }) => ({
                heading,
                img: await fetchWikipediaImage(searchQuery),
            }))
        );

        const map = {};
        results.forEach(({ heading, img }) => { if (img) map[heading] = img; });

        setImageCache(prev => ({ ...prev, [chapterKey]: map }));
        setLoadingImages(false);
    };

    // -------------------------------------------------------------------------
    // cleanHtml — strips markdown fences AND fixes any markdown leakage
    // that slips through from the AI despite prompt instructions.
    // Run this on raw AI output before rendering.
    // -------------------------------------------------------------------------
    const cleanHtml = (raw = '') => {
        let s = raw
            // strip ```html ... ``` fences
            .replace(/^```html\s*/i, '').replace(/```\s*$/i, '')
            // strip any remaining ``` fences mid-text
            .replace(/```[a-z]*\n?/gi, '').replace(/```/g, '')
            .trim();

        // Fix **bold** → <strong>bold</strong> (outside existing HTML tags)
        // Uses a naive approach that works on text nodes between tags
        s = s.replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>');
        // Fix *italic* → <em>italic</em>
        s = s.replace(/\*([^*\n]+?)\*/g, '<em>$1</em>');
        // Fix `inline code` → <code>inline code</code>
        s = s.replace(/`([^`\n]+?)`/g, '<code style="background:#f1f5f9;color:#0f172a;padding:0.15rem 0.35rem;border-radius:0.25rem;font-size:0.85em;font-family:monospace;">$1</code>');
        // Fix bare ## Heading lines that weren't converted
        s = s.replace(/^#{3}\s+(.+)$/gm, '<h3 style="font-size:1.2rem;font-weight:700;margin-top:1.75rem;margin-bottom:0.5rem;color:#4f46e5;border-left:4px solid #6366f1;padding-left:0.75rem;">$1</h3>');
        s = s.replace(/^#{2}\s+(.+)$/gm, '<h2 style="font-size:1.65rem;font-weight:800;margin-top:1.5rem;margin-bottom:0.75rem;color:#1e293b;border-bottom:3px solid #6366f1;padding-bottom:0.5rem;">$1</h2>');
        s = s.replace(/^#{1}\s+(.+)$/gm, '<h2 style="font-size:1.65rem;font-weight:800;margin-top:1.5rem;margin-bottom:0.75rem;color:#1e293b;border-bottom:3px solid #6366f1;padding-bottom:0.5rem;">$1</h2>');
        // Fix bare --- horizontal rules
        s = s.replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid #e2e8f0;margin:1.5rem 0;">');

        return s;
    };

    const getRenderedHtml = (note, chapterKey) => {
        const clean = cleanHtml(note?.notes ?? '');
        const imgMap = imageCache[chapterKey] ?? {};
        return Object.keys(imgMap).length > 0 ? injectImages(clean, imgMap) : clean;
    };

    // -------------------------------------------------------------------------
    // PDF Download — includes KaTeX + code styling + Equiskill AI branding
    // -------------------------------------------------------------------------
    const handleDownloadPdf = async () => {
        setDownloading(true);
        try {
            const chaptersHtml = Notes.map((note, idx) => {
                const key = note?.chapterId ?? idx;
                const html = getRenderedHtml(note, key);
                return `<div class="chapter" style="page-break-after:${idx < Notes.length - 1 ? 'always' : 'auto'};">${html}</div>`;
            }).join('\n');

            const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Course Notes</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"><\/script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"><\/script>
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; color: #1e293b; max-width: 820px; margin: 0 auto; padding: 2rem; line-height: 1.8; font-size: 10pt; }
    h2 { font-size: 1.55rem; font-weight: 800; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #1e293b; border-bottom: 3px solid #6366f1; padding-bottom: 0.45rem; }
    h3 { font-size: 1.15rem; font-weight: 700; margin-top: 1.6rem; margin-bottom: 0.45rem; color: #4f46e5; border-left: 4px solid #6366f1; padding-left: 0.7rem; }
    h4 { font-size: 0.82rem; font-weight: 700; margin-top: 1rem; margin-bottom: 0.3rem; color: #475569; text-transform: uppercase; letter-spacing: 0.04em; }
    p { margin-bottom: 0.85rem; line-height: 1.8; }
    ul, ol { margin-left: 1.5rem; margin-bottom: 0.85rem; }
    li { margin-bottom: 0.4rem; line-height: 1.75; }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 1.5rem 0; }

    table {
        border-collapse: collapse;
        width: 100%;
        margin: 1rem 0 1.5rem;
        font-size: 0.9rem;
    }

    th {
        border: 1px solid #c7d2fe;
        padding: 0.5rem 0.75rem;
        background: #eef2ff;
        font-weight: 700;
        color: #312e81;
        text-align: left;
    }

    td {
        border: 1px solid #e0e7ff;
        padding: 0.5rem 0.75rem;
        color: #374151;
        vertical-align: top;
    }

    tr:nth-child(even) td { background: #f5f7ff; }
    tr:nth-child(odd) td { background: #ffffff; }

    blockquote {
        border-left: 4px solid #6366f1;
        margin: 1rem 0;
        padding: 0.6rem 1rem;
        background: #eef2ff;
        border-radius: 0 0.4rem 0.4rem 0;
    }

    blockquote p {
        margin: 0;
        color: #312e81;
        font-style: italic;
    }

    figure {
        text-align: center;
        margin: 1.25rem 0;
    }

    figure img {
        max-width: 100%;
        max-height: 340px;
        object-fit: contain;
        border-radius: 0.5rem;
        border: 1px solid #e0e7ff;
    }

    figcaption {
        font-size: 0.78rem;
        color: #64748b;
        font-style: italic;
        margin-top: 0.4rem;
    }

    pre {
        background: #0f172a;
        color: #e2e8f0;
        border-radius: 0.5rem;
        padding: 0.9rem 1.2rem;
        overflow-x: auto;
        font-size: 0.82rem;
        margin: 1rem 0;
        line-height: 1.6;
    }

    code {
        font-family: 'Courier New', Consolas, monospace;
    }

    pre code {
        background: none;
        color: inherit;
        padding: 0;
        font-size: inherit;
    }

    :not(pre) > code {
        background: #f1f5f9;
        color: #0f172a;
        padding: 0.1rem 0.3rem;
        border-radius: 0.2rem;
        font-size: 0.82em;
    }

    .chapter {
        margin-bottom: 2rem;
        position: relative;
        z-index: 1;
    }

    /* Equiskill Watermark */
    .equiskill-watermark {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);

        display: flex;
        justify-content: center;
        align-items: center;

        opacity: 0.06;
        pointer-events: none;
        z-index: 0;
    }

    .equiskill-watermark img {
        width: 300px;
        height: auto;
    }

    @page {
        margin: 1.5cm 1.5cm 2.5cm;
    }
</style>

</head>
<body>
    <!-- Equiskill AI branding watermark -->
<div class="equiskill-watermark">

  <img src="${EQUISKILL_LOGO_B64}" alt="Equiskill AI" />

</div>


  ${chaptersHtml}

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      if (window.renderMathInElement) {
        renderMathInElement(document.body, {
          delimiters: [
            { left: '\\\\(', right: '\\\\)', display: false },
            { left: '\\\\[', right: '\\\\]', display: true },
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
          ],
          throwOnError: false,
        });
      }
      setTimeout(function() { window.focus(); window.print(); }, 2000);
    });
  <\/script>
</body>
</html>`;

            const blob = new Blob([fullHtml], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const win = window.open(url, '_blank');
            // fallback: if onload doesn't fire reliably, the script inside handles printing
        } catch (err) {
            console.error('PDF download error:', err);
        } finally {
            setDownloading(false);
        }
    };

    const currentNote = Notes.length > 0 && stepCount < Notes.length ? Notes[stepCount] : null;
    const currentChapterKey = currentNote?.chapterId ?? stepCount;

    return (
        <>
            {/* KaTeX CSS + JS — loaded once */}
            <link
                rel="stylesheet"
                href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"
            />
            <Script
                src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"
                strategy="afterInteractive"
                onLoad={() => {
                    // Load auto-render after katex itself
                    const ar = document.createElement('script');
                    ar.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js';
                    ar.onload = () => setKatexReady(true);
                    document.head.appendChild(ar);
                }}
            />

            <div className="max-w-screen-lg mx-auto px-4 sm:px-8 mt-6">
                {/* Top bar */}
                <div className="flex items-center justify-between mb-6">
                    <Button variant="ghost" className="text-gray-500 hover:text-gray-800 flex items-center gap-1" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Button>

                    {Notes.length > 0 && stepCount < Notes.length && (
                        <div className="flex items-center gap-3">
                            {loadingImages && (
                                <span className="text-xs text-gray-400 flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Fetching diagrams...
                                </span>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownloadPdf}
                                disabled={downloading}
                                className="flex items-center gap-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                {downloading ? 'Preparing...' : 'Download PDF'}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Chapter label */}
                {currentNote && (
                    <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                        Chapter {stepCount + 1} &nbsp;·&nbsp; {stepCount + 1} / {Notes.length}
                    </p>
                )}

                {/* Step progress dots — top navigation only (no duplicate bottom arrows here) */}
                <div className='flex items-center gap-3 sm:gap-5 justify-center'>
                    <div className="flex flex-1 items-center justify-center gap-2 sm:gap-3">
                        {Notes?.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => { setDirection(index > stepCount ? 1 : -1); setStepCount(index); }}
                                className={`h-2 rounded-full transition-all duration-300 
                                ${index === stepCount ? 'bg-primary w-8 sm:w-10' : index < stepCount ? 'bg-primary/40 w-5 sm:w-7' : 'bg-gray-300 w-4 sm:w-6'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Notes content */}
                <div className='mt-6 relative overflow-hidden'>
                    <AnimatePresence mode="wait" custom={direction}>
                        {Notes.length > 0 && stepCount < Notes.length && currentNote && (
                            <motion.div
                                key={stepCount}
                                initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="relative bg-white shadow-md rounded-xl w-full max-w-4xl mx-auto px-8 py-8 pb-12 text-base leading-relaxed notes-content"
                                style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: '#374151' }}
                            >
                                {/* Equiskill branding watermark — visible on screen and in PDF */}
                                <div style={{
                                    position: 'absolute', bottom: '14px', right: '18px',
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    opacity: 0.13, pointerEvents: 'none', userSelect: 'none',
                                }}>
                                    <img src={EQUISKILL_LOGO_B64} alt="Equiskill AI" style={{ height: '20px', width: 'auto' }} />
                                </div>
                                <div
                                    ref={noteContentRef}
                                    dangerouslySetInnerHTML={{
                                        __html: getRenderedHtml(currentNote, currentChapterKey)
                                    }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* End screen */}
                    {stepCount === Notes.length && Notes.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className='flex flex-col items-center gap-5 mt-12 p-10 border border-gray-200 rounded-2xl bg-white shadow-sm max-w-md mx-auto'
                        >
                            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800">All chapters completed!</h2>
                            <p className="text-gray-500 text-sm text-center">You have gone through all the notes. Great work.</p>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setStepCount(0)}>Start Over</Button>
                                <Button onClick={() => router.back()}>Back to Course</Button>
                            </div>
                        </motion.div>
                    )}

                    {Notes.length === 0 && (
                        <div className="text-center py-16 text-gray-400">
                            <p>No notes available yet. Generate them from the course page.</p>
                        </div>
                    )}
                </div>

                {/* Bottom navigation — single set of Prev/Next buttons */}
                {Notes.length > 0 && stepCount < Notes.length && (
                    <div className="flex justify-between mt-8 mb-10">
                        <Button
                            variant="outline"
                            onClick={() => { setDirection(-1); setStepCount(s => s - 1); }}
                            disabled={stepCount === 0}
                            className="flex items-center gap-2"
                        >
                            <ChevronLeft className="w-4 h-4" /> Previous Chapter
                        </Button>
                        <Button
                            onClick={() => { setDirection(1); setStepCount(s => s + 1); }}
                            className="flex items-center gap-2"
                        >
                            {stepCount === Notes.length - 1 ? 'Finish' : 'Next Chapter'} <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Global styles for AI-generated HTML content */}
            <style jsx global>{`
                /* ── Typography ── */
                .notes-content h2 {
                    font-size: 1.65rem; font-weight: 800;
                    color: #1e293b;
                    border-bottom: 3px solid #6366f1;
                    padding-bottom: 0.5rem;
                    margin-top: 1.5rem; margin-bottom: 0.75rem;
                }
                .notes-content h3 {
                    font-size: 1.2rem; font-weight: 700;
                    color: #4f46e5;
                    border-left: 4px solid #6366f1;
                    padding-left: 0.75rem;
                    margin-top: 1.75rem; margin-bottom: 0.5rem;
                }
                .notes-content h4 {
                    font-size: 0.85rem; font-weight: 700;
                    color: #475569;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    margin-top: 1.1rem; margin-bottom: 0.3rem;
                }
                .notes-content p {
                    margin-bottom: 0.9rem; line-height: 1.8; color: #374151; font-size: 1rem;
                }
                .notes-content ul, .notes-content ol {
                    margin-left: 1.5rem; margin-bottom: 0.9rem;
                }
                .notes-content li {
                    margin-bottom: 0.5rem; line-height: 1.75; color: #374151;
                }
                .notes-content hr {
                    border: none; border-top: 1px solid #e2e8f0; margin: 1.5rem 0;
                }

                /* ── Tables ── */
                .notes-content table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 1rem 0 1.5rem;
                    font-size: 0.95rem;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
                    border-radius: 0.5rem;
                    overflow: hidden;
                }
                .notes-content th {
                    border: 1px solid #c7d2fe;
                    padding: 0.6rem 0.85rem;
                    background: #eef2ff;
                    font-weight: 700;
                    color: #312e81;
                    text-align: left;
                }
                .notes-content td {
                    border: 1px solid #e0e7ff;
                    padding: 0.55rem 0.85rem;
                    color: #374151;
                    vertical-align: top;
                }
                .notes-content tr:nth-child(even) td { background: #f5f7ff; }
                .notes-content tr:nth-child(odd) td  { background: #ffffff; }

                /* ── Blockquote / Key Definitions ── */
                .notes-content blockquote {
                    border-left: 4px solid #6366f1;
                    margin: 1rem 0;
                    padding: 0.6rem 1.1rem;
                    background: #eef2ff;
                    border-radius: 0 0.4rem 0.4rem 0;
                }
                .notes-content blockquote p {
                    margin: 0; color: #312e81; font-style: italic; line-height: 1.7;
                }

                /* ── Code blocks ── */
                .notes-content pre {
                    background: #0f172a;
                    color: #e2e8f0;
                    border-radius: 0.6rem;
                    padding: 1.1rem 1.35rem;
                    overflow-x: auto;
                    font-size: 0.88rem;
                    margin: 1rem 0;
                    line-height: 1.65;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.18);
                }
                .notes-content code {
                    font-family: 'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace;
                }
                .notes-content pre code {
                    background: none; color: inherit; padding: 0; font-size: inherit; border-radius: 0;
                }
                .notes-content :not(pre) > code {
                    background: #f1f5f9; color: #0f172a;
                    padding: 0.15rem 0.4rem; border-radius: 0.25rem;
                    font-size: 0.85em; font-family: monospace;
                }

                /* ── KaTeX ── */
                .notes-content .katex-display {
                    overflow-x: auto; overflow-y: hidden; padding: 0.5rem 0; margin: 0.75rem 0;
                }
                .notes-content .katex { font-size: 1.05em; }

                /* ── Figures / Wikipedia images ── */
                .notes-content figure {
display: flex;
flex-direction: column;
align-items: center;

width: fit-content;
max-width: 560px;

margin: 1.5rem auto;

background: #f8fafc;
border: 1px solid #e2e8f0;
border-radius: 0.75rem;
padding: 0.75rem;

}
.notes-content figure img {
display: block;
margin: 0 auto;

max-width: 100%;
max-height: 340px;

object-fit: contain;
border-radius: 0.5rem;

}
.notes-content figcaption {
text-align: center;
margin-top: 0.5rem;
}
            `}</style>
        </>
    );
}

export default ViewNotes;
