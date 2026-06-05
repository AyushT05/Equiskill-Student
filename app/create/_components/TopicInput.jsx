import React from 'react'
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const difficulties = [
    {
        value: 'Easy',
        label: 'Easy',
        description: 'Foundational concepts, simple language',
        color: 'text-emerald-600',
        dot: 'bg-emerald-400',
    },
    {
        value: 'Medium',
        label: 'Medium',
        description: 'Balanced depth and complexity',
        color: 'text-amber-600',
        dot: 'bg-amber-400',
    },
    {
        value: 'Hard',
        label: 'Hard',
        description: 'Advanced topics, detailed explanations',
        color: 'text-rose-600',
        dot: 'bg-rose-400',
    },
];

function TopicInput({ SetTopic, setDifficultyLevel }) {
    return (
        <div className='space-y-5'>
            {/* Topic textarea */}
            <div className='space-y-1.5'>
                <label className='text-sm font-medium text-slate-700'>
                    Topic or content
                </label>
                <Textarea
                    placeholder='e.g. "The water cycle and its stages" or paste a paragraph from your textbook…'
                    className='min-h-[120px] resize-none text-sm text-slate-800 placeholder:text-slate-400 border-slate-200 rounded-xl focus:border-primary focus:ring-primary/20'
                    onChange={(e) => SetTopic(e.target.value)}
                />
                <p className='text-xs text-slate-400'>Be as specific as you like — more detail gives better results.</p>
            </div>

            {/* Difficulty */}
            <div className='space-y-1.5'>
                <label className='text-sm font-medium text-slate-700'>
                    Difficulty level
                </label>
                <Select onValueChange={(value) => setDifficultyLevel(value)}>
                    <SelectTrigger className='w-full rounded-xl border-slate-200 text-sm text-slate-700 focus:border-primary focus:ring-primary/20'>
                        <SelectValue placeholder='Choose a difficulty…' />
                    </SelectTrigger>
                    <SelectContent className='rounded-xl border-slate-200 shadow-md'>
                        {difficulties.map((d) => (
                            <SelectItem key={d.value} value={d.value} className='rounded-lg cursor-pointer'>
                                <div className='flex items-center gap-2.5 py-0.5'>
                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${d.dot}`} />
                                    <span className={`font-medium ${d.color}`}>{d.label}</span>
                                    <span className='text-slate-400 text-xs'>{d.description}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

export default TopicInput;