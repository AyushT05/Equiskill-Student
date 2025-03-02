import Image from 'next/image'
import React, { useState } from 'react'

function SelectOption({selectedStudyType}) {
  
    const Options= [
        {
        name:'5th Class', 
        icon:'/five.png'

        }, 
        {
            name:'6th Class', 
            icon:'/six.png'
    
        }, 
        {
            name:'7th Class', 
            icon:'/seven.png'
    
        }, 
        {
            name:'8th Class', 
            icon:'/eight.png'
    
        }, 
        {
            name:'9th Class', 
            icon:'/nine.png'
    
        }, 
        {
            name:'10th Class', 
            icon:'/ten.png'
    
        },
        {
            name:'11th Class', 
            icon:'/eleven.png'
    
        },
        {
            name:'12th Class', 
            icon:'/twelve.png'
    
        },
        {
            name:'University', 
            icon:'/uni.png'
    
        },
      
    ]
    const [selectedOption, setSelectedOption] = useState();
    return (
    <div>
     <h2 className='text-center mb-2 text-lg'> 
        What class are you in?
     </h2>
     <div className ='grid grid-cols-2 mt-5 md:grid-cols-3 lg:grid-cols-5 gap-5'> 
        {Options.map((option,index)=> (
            <div key={index} className = {`p-4 flex flex-col items-center justify-center border rounded-xl 
                hover:border-primary cursor-pointer ${option?.name==selectedOption&&'border-primary'}`} 
                onClick={()=>{setSelectedOption(option.name); selectedStudyType(option.name)}}
            >
                <Image src={option.icon} alt={option.name} width={50} height={50} />
                <h2 className = 'text-sm mt-2' >{option.name}</h2>
            </div> 

        )

            
        )}

     </div>
    </div>
  )
}

export default SelectOption