"use client";

import { Button } from "@/components/ui/button";
import axios from "axios";
import { RefreshCcw } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { STUDY_TYPES } from "@/configs/studyTypes";

// Map item.type (UI key) → STUDY_TYPES enum value (DB value)
const TYPE_MAP = {
    flashCard: STUDY_TYPES.FLASHCARD,
    quiz: STUDY_TYPES.QUIZ,
    question: STUDY_TYPES.QNA,
    notes: STUDY_TYPES.NOTES,
};

const POLL_INTERVAL_MS = 4000;
const POLL_MAX_ATTEMPTS = 30; // ~2 minutes max

function MaterialCardItem({ item, studyTypeContent, course, refreshData }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const pollRef = useRef(null);
    const pollCount = useRef(0);

    // Derive whether content is ready from the parent's studyTypeContent
    const dbType = TYPE_MAP[item.type];
    const contentEntry = studyTypeContent?.[item.type];
    const isReady =
        item.type === "notes"
            ? Array.isArray(studyTypeContent?.notes) && studyTypeContent.notes.length > 0
            : contentEntry?.status === "Ready";

    // Stop polling once content is ready
    useEffect(() => {
        if (isReady && pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
            setLoading(false);
        }
    }, [isReady]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, []);

    const startPolling = () => {
        pollCount.current = 0;
        pollRef.current = setInterval(async () => {
            pollCount.current += 1;
            await refreshData();
            if (pollCount.current >= POLL_MAX_ATTEMPTS) {
                clearInterval(pollRef.current);
                pollRef.current = null;
                setLoading(false);
                toast.error("Content generation is taking longer than expected. Please refresh the page.");
            }
        }, POLL_INTERVAL_MS);
    };

    const GenerateContent = async () => {
        if (!dbType) return;

        toast("Generating your content — this may take a minute!");
        setLoading(true);

        let chapters = "";
        course?.courseLayout?.chapters?.forEach((chapter) => {
            chapters += (chapter.chapter_title || chapter.chapterTitle || "") + ",";
        });

        try {
            await axios.post("/api/study-type-content", {
                courseId: course?.courseId,
                type: dbType,
                chapters,
            });

            // Content generates async via Inngest — poll until status = "Ready"
            startPolling();
        } catch (error) {
            console.error("Error generating content:", error);
            toast.error("Failed to start generation. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div
            className={`flex flex-col gap-3 items-center p-5 border shadow-md rounded-lg w-full max-w-[250px] mx-auto
            ${!isReady ? "grayscale" : ""}`}
        >
            <h2 className="p-1 px-2 bg-green-500 text-white rounded-full text-[10px] mb-2">
                {isReady ? "Ready" : loading ? "Generating..." : "Not Ready"}
            </h2>

            <Image src={item.icon} alt={item.name} width={50} height={50} />
            <h2 className="font-bold text-lg text-center">{item.name}</h2>
            <p className="text-gray-400 text-sm text-center">{item.desc}</p>

            {isReady ? (
                <Button
                    className="mt-2 w-full bg-primary text-white"
                    variant="outline"
                    onClick={() => router.push(`/course/${course?.courseId}${item.path}`)}
                >
                    View
                </Button>
            ) : (
                <Button
                    className="mt-2 w-full bg-primary text-white"
                    variant="outline"
                    onClick={GenerateContent}
                    disabled={loading}
                >
                    {loading && <RefreshCcw className="animate-spin mr-2" />}
                    {loading ? "Generating..." : "Generate"}
                </Button>
            )}
        </div>
    );
}

export default MaterialCardItem;