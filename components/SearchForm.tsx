'use client';

import { useState, useRef } from 'react';
import { Search, Loader2, Camera, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchFormProps {
    onSearch: (query: string) => void;
    onImageSearch: (formData: FormData) => void;
    isLoading: boolean;
}

export function SearchForm({ onSearch, onImageSearch, isLoading }: SearchFormProps) {
    const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
    const [query, setQuery] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (activeTab === 'text') {
            if (query.trim()) {
                onSearch(query.trim());
            }
        } else {
            if (selectedFile) {
                const formData = new FormData();
                formData.append('image', selectedFile);
                onImageSearch(formData);
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto relative z-10">

            {/* Tabs */}
            <div className="flex justify-center mb-6">
                <div className="bg-zinc-900/80 p-1 rounded-full border border-white/10 backdrop-blur-md inline-flex">
                    <button
                        onClick={() => setActiveTab('text')}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                            activeTab === 'text'
                                ? "bg-white text-black shadow-lg"
                                : "text-zinc-400 hover:text-white"
                        )}
                    >
                        <Search className="w-4 h-4" />
                        Text Search
                    </button>
                    <button
                        onClick={() => setActiveTab('image')}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                            activeTab === 'image'
                                ? "bg-white text-black shadow-lg"
                                : "text-zinc-400 hover:text-white"
                        )}
                    >
                        <Camera className="w-4 h-4" />
                        Image Search
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-2xl min-h-[72px]">

                    {activeTab === 'text' ? (
                        <>
                            <Search className="w-6 h-6 text-zinc-400 ml-4 shrink-0" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search for anything... (e.g., 'Sony WH-1000XM5 headphones')"
                                className="w-full bg-transparent text-white placeholder-zinc-500 px-4 py-3 text-lg focus:outline-none"
                                disabled={isLoading}
                            />
                        </>
                    ) : (
                        <>
                            <div
                                className="flex-1 flex items-center px-4 cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="flex items-center gap-4 w-full">
                                    <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700">
                                        {selectedFile ? (
                                            <img
                                                src={URL.createObjectURL(selectedFile)}
                                                alt="Preview"
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        ) : (
                                            <Upload className="w-6 h-6 text-zinc-500" />
                                        )}
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-white font-medium">
                                            {selectedFile ? selectedFile.name : "Upload product image"}
                                        </span>
                                        <span className="text-sm text-zinc-500">
                                            {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : "JPG, PNG, WebP up to 10MB"}
                                        </span>
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/webp"
                                    disabled={isLoading}
                                />
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || (activeTab === 'text' ? !query.trim() : !selectedFile)}
                        className={cn(
                            "px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 ml-2 shrink-0",
                            "bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500",
                            "shadow-lg shadow-blue-500/25",
                            "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                        )}
                    >
                        {isLoading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            "Search"
                        )}
                    </button>
                </div>
            </form>

            {/* Example Prompts (Only for text tab) */}
            {activeTab === 'text' && (
                <div className="mt-4 flex flex-wrap gap-2 justify-center text-sm">
                    <span className="text-zinc-500">Try:</span>
                    {[
                        "Wireless noise cancelling headphones",
                        "MacBook Pro M3",
                        "Ergonomic office chair",
                        "Vintage leather jacket"
                    ].map((prompt, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setQuery(prompt);
                                // Optional: auto-search
                            }}
                            className="text-zinc-400 hover:text-white hover:underline transition-colors cursor-pointer"
                        >
                            "{prompt}"
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
