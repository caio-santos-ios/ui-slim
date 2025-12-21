'use client';

import React, { useState, useRef, useEffect } from 'react';
import { IoMdClose } from 'react-icons/io';
import { HiChevronDown } from 'react-icons/hi';
import { FaRegCheckCircle } from "react-icons/fa";

type TProp<T> = {
    options: T[];
    placeholder?: string;
    labelKey: keyof T; 
    valueKey: keyof T; 
    onChange?: (selected: T[]) => void;
    value: any[],
    maxSelected: number,
    descriptionSelectedMax: string
}

export default function MultiSelect<T>({ 
    options, 
    labelKey, 
    valueKey, 
    placeholder = "Selecione...",
    onChange,
    value,
    maxSelected = 10,
    descriptionSelectedMax = "items selecionados"
}: TProp<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<T[]>(value);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setSelected(value);
    }, [value]);

    const toggleOption = (option: T) => {
        const isSelected = selected.some((item) => item[valueKey] === option[valueKey]);
        let newSelection: T[];

        if (isSelected) {
            newSelection = selected.filter((item) => item[valueKey] !== option[valueKey]);
        } else {
            newSelection = [...selected, option];
        }

        setSelected(newSelection);
        if (onChange) onChange(newSelection);
    };

    const removeOption = (e: React.MouseEvent, option: T) => {
        e.stopPropagation();
        const newSelection = selected.filter((item) => item[valueKey] !== option[valueKey]);
        setSelected(newSelection);
        if (onChange) onChange(newSelection);
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="h-11 w-full border border-gray-300 rounded-lg p-1 flex flex-wrap gap-2 items-center cursor-pointer bg-white"
            >
                {selected.length === 0 && (
                    <span className="text-gray-400 ml-2">{placeholder}</span>
                )}
                
                {
                    selected.length > maxSelected ?
                    <span className="flex items-center gap-1 bg-blue-100 slim-text-primary font-bold px-1 rounded-md text-sm">
                        <span className='py-1.5'>
                            {selected.length} {descriptionSelectedMax}
                        </span>
                    </span>
                    :
                    selected.map((option, index) => (
                        <span key={String(option[valueKey]) + index} className="flex items-center gap-1 bg-blue-100 slim-text-primary font-bold px-1 rounded-md text-sm">
                            {String(option[labelKey])}
                            <button onClick={(e) => removeOption(e, option)}>
                                <IoMdClose size={14} className="hover:text-red-500" />
                            </button>
                        </span>
                    ))
                }
                <HiChevronDown className="ml-auto mr-2" />
            </div>

            {isOpen && (
                <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {options.map((option, index) => {
                        const isSelected = selected.some((item) => item[valueKey] === option[valueKey]);
                        return (
                            <li
                                key={String(option[valueKey]) + index}
                                onClick={() => toggleOption(option)}
                                className={`px-4 py-2 cursor-pointer flex justify-between hover:bg-gray-50 ${
                                    isSelected ? 'bg-blue-50 slim-text-primary font-bold' : ''
                                }`}>
                                {String(option[labelKey])}
                                {isSelected && <FaRegCheckCircle className='mr-2' /> }
                            </li>
                        );
                    })}
                    {
                        options.length == 0 &&
                        (

                            <li className={`px-4 py-2 flex justify-between font-bold`}>
                                Sem opções
                            </li>
                        )
                    }
                </ul>
            )}
        </div>
    );
}