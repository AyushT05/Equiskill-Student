import React from 'react';

function ChapterList({ course }) {
    const Chapters = course?.courseLayout?.chapters;
    return (
        <div className="mt-5">
            <h2 className="font-medium text-xl md:text-2xl">Chapter List</h2>
            <div className="mt-3">
                {Chapters?.map((item, index) => (
                    <div
                        key={index}
                        className="flex flex-col sm:flex-row gap-5 items-start sm:items-center p-4 border shadow-md mb-2 rounded-lg cursor-pointer"
                    >
                        <h2 className="text-2xl">{item?.emoji}</h2>
                        <div>
                            <h2 className="font-medium text-lg">{item?.chapter_title}</h2>
                            <p className="text-sm text-gray-500">{item?.chapter_summary}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ChapterList;
