import Image from 'next/image'
import React, { useState } from 'react'

function SelectOption({ selectedStudyType }) {

    const Options = [
        { name: '5th Class',   icon: '/five.png'   },
        { name: '6th Class',   icon: '/six.png'    },
        { name: '7th Class',   icon: '/seven.png'  },
        { name: '8th Class',   icon: '/eight.png'  },
        { name: '9th Class',   icon: '/nine.png'   },
        { name: '10th Class',  icon: '/ten.png'    },
        { name: '11th Class',  icon: '/eleven.png' },
        { name: '12th Class',  icon: '/twelve.png' },
        { name: 'University',  icon: '/uni.png'    },
    ];

    const [selectedOption, setSelectedOption] = useState(null);

    return (
        <div className='grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3'>
            {Options.map((option, index) => {
                const isSelected = option.name === selectedOption;
                return (
                    <button
                        key={index}
                        type='button'
                        onClick={() => {
                            setSelectedOption(option.name);
                            selectedStudyType(option.name);
                        }}
                        className={`group relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
                            ${isSelected
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-slate-200 bg-white hover:border-primary/40 hover:bg-slate-50'
                            }`}
                    >
                        {/* Selected indicator dot */}
                        <span className={`absolute top-2 right-2 w-2 h-2 rounded-full transition-all duration-200
                            ${isSelected ? 'bg-primary scale-100' : 'scale-0'}`}
                        />

                        <div className={`transition-transform duration-200 ${isSelected ? 'scale-105' : 'group-hover:scale-105'}`}>
                            <Image src={option.icon} alt={option.name} width={40} height={40} className='object-contain' />
                        </div>

                        <span className={`text-xs font-medium leading-tight text-center transition-colors duration-200
                            ${isSelected ? 'text-primary' : 'text-slate-600 group-hover:text-slate-800'}`}>
                            {option.name}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

export default SelectOption;