'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Page() {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [wineSearch, setWineSearch] = useState('');
    const [wineSuggestions, setWineSuggestions] = useState<any[]>([]);
    const [selectedWine, setSelectedWine] = useState<any>(null);
    const [isNewWine, setIsNewWine] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        wineName: '',
        year: '',
        grape: '',
        rating: '',
        review: '',
    });

    useEffect(() => {
        const fetchUser = async () => {
            const { data: userLoggedIn } = await supabase.auth.getUser();
            if (!userLoggedIn) {
                router.push('/');
            } else {
                setUser(userLoggedIn.user);
            }
        };
        fetchUser();
    }, [supabase, router]);

    const handleWineSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setWineSearch(query);

        if (query.length > 2) { // Only search if the query is longer than 2 characters
            const { data, error } = await supabase
                .from('wines')
                .select('*')
                .ilike('wine_name', `%${query}%`)
                .limit(10);

            if (error) {
                console.error(error);
            } else {
                setWineSuggestions(data);
            }
        } else {
            setWineSuggestions([]);
        }
    };

    const handleWineSelect = (wine: any) => {
        setSelectedWine(wine);
        setFormData({
            wineName: wine.wine_name,
            year: wine.year.toString(),
            grape: wine.grape,
            rating: '',
            review: '',
        });
        setWineSearch(wine.wine_name);
        setWineSuggestions([]);
        setIsNewWine(false);
    };

    const handleNewWineToggle = () => {
        setSelectedWine(null);
        setFormData({
            wineName: '',
            year: '',
            grape: '',
            rating: '',
            review: '',
        });
        setWineSearch('');
        setIsNewWine(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setLoading(true);

        const form = new FormData(e.currentTarget)

        const { wineName, year, grape, rating, review } = formData;
        const imageFile = form.get('image') as File;

        const { error: uploadDataError } = await supabase.storage.from('wine-images').upload(`${wineName}-${Date.now()}`, imageFile);

        if (uploadDataError) {
            console.error(uploadDataError);
            setLoading(false);
            return;
        }

        const { data: imageUrlData } = await supabase.storage.from('wine-images').getPublicUrl(imageFile.name);

        if (!imageUrlData?.publicUrl) {
            console.error('Error getting image URL');
            setLoading(false);
            return;
        }

        let wineId = selectedWine ? selectedWine.id : null;



        if (!wineId && isNewWine) {
            const { data: newWine, error: newWineError } = await supabase
                .from('wines')
                .insert({
                    wine_name: wineName,
                    year: parseInt(year),
                    grape: grape,
                })
                .select()
                .single();

            if (newWineError) {
                console.error(newWineError);
                setLoading(false);
                return;
            }
            wineId = newWine.id;
        }

        const { error: reviewError } = await supabase.from('reviews').insert({
            wine_id: wineId,
            reviewer_id: user.id,
            rating: parseFloat(rating),
            review: review,
            image_url: imageUrlData.publicUrl,
        });

        if (reviewError) {
            console.error(reviewError);
            setLoading(false);
            return;
        }

        setLoading(false);
        alert('Review submitted successfully!');
    };

    return (
        <div className='flex flex-col'>
            <h1 className="text-2xl mb-4">Gi en review</h1>
            <form
                onSubmit={handleSubmit}
                className='max-w-lg mx-auto p-4 bg-white shadow-md rounded-lg'
            >
                {!isNewWine && (
                    <div className='mb-4'>
                    <label
                        htmlFor='wineSearch'
                        className='block text-sm font-medium text-gray-700'
                    >
                        Search Wine:
                    </label>
                    <input
                        type='text'
                        id='wineSearch'
                        name='wineSearch'
                        value={wineSearch}
                        onChange={handleWineSearch}
                        className='mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                    />
                    {wineSuggestions.length > 0 && (
                        <ul className="border border-gray-300 rounded-md mt-2 bg-white max-h-48 overflow-y-auto">
                            {wineSuggestions.map((wine) => (
                                <li
                                    key={wine.id}
                                    onClick={() => handleWineSelect(wine)}
                                    className="p-2 cursor-pointer hover:bg-indigo-100"
                                >
                                    {wine.wine_name} ({wine.year})
                                </li>
                            ))}
                        </ul>
                    )}
                </div>)}

                <div className='mb-4'>
                    <label className='flex items-center'>
                        <input
                            type='checkbox'
                            checked={isNewWine}
                            onChange={handleNewWineToggle}
                            className='form-checkbox'
                        />
                        <span className='ml-2 text-sm font-medium text-gray-700'>Add New Wine</span>
                    </label>
                </div>

                <div className='mb-4'>
                    <label
                        htmlFor='wineName'
                        className='block text-sm font-medium text-gray-700'
                    >
                        Wine Name:
                    </label>
                    <input
                        type='text'
                        id='wineName'
                        name='wineName'
                        value={formData.wineName}
                        onChange={handleInputChange}
                        disabled={!isNewWine && selectedWine}
                        className='mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                        required
                    />
                </div>

                <div className='mb-4'>
                    <label
                        htmlFor='year'
                        className='block text-sm font-medium text-gray-700'
                    >
                        Year:
                    </label>
                    <input
                        type='number'
                        id='year'
                        name='year'
                        value={formData.year}
                        onChange={handleInputChange}
                        disabled={!isNewWine && selectedWine}
                        className='mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                        required
                    />
                </div>

                <div className='mb-4'>
                    <label
                        htmlFor='grape'
                        className='block text-sm font-medium text-gray-700'
                    >
                        Grape:
                    </label>
                    <input
                        type='text'
                        id='grape'
                        name='grape'
                        value={formData.grape}
                        onChange={handleInputChange}
                        disabled={!isNewWine && selectedWine}
                        className='mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                        required
                    />
                </div>

                <div className='mb-4'>
                    <label
                        htmlFor='rating'
                        className='block text-sm font-medium text-gray-700'
                    >
                        Rating (0-5):
                    </label>
                    <input
                        type='number'
                        id='rating'
                        name='rating'
                        min='0'
                        max='5'
                        step='0.1'
                        value={formData.rating}
                        onChange={handleInputChange}
                        className='mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                        required
                    />
                </div>

                <div className='mb-4'>
                    <label
                        htmlFor='review'
                        className='block text-sm font-medium text-gray-700'
                    >
                        Review:
                    </label>
                    <textarea
                        id='review'
                        name='review'
                        value={formData.review}
                        onChange={handleInputChange}
                        className='mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                        required
                    />
                </div>

                <div className='mb-4'>
                    <label
                        htmlFor='image'
                        className='block text-sm font-medium text-gray-700'
                    >
                        Wine Image:
                    </label>
                    <input
                        type='file'
                        id='image'
                        name='image'
                        accept='image/*'
                        onChange={handleImageChange}
                        className='mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                        required
                    />
                </div>

                <div>
                    <button
                        type='submit'
                        disabled={loading}
                        className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                    >
                        {loading ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </form>
        </div>
    );
}
