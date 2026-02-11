'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Header from '@/components/dashboard/Header'

export default function EditProfilePage() {
    const [profile, setProfile] = useState(null)
    const [fullName, setFullName] = useState('')
    const [instituteName, setInstituteName] = useState('')
    const [educationLevel, setEducationLevel] = useState('')
    const [degree, setDegree] = useState('')
    const [academicYear, setAcademicYear] = useState('')
    const [avatarFile, setAvatarFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    const supabase = createSupabaseClient()
    const router = useRouter()

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/auth/login')
                return
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (error) throw error

            setProfile(data)
            setFullName(data.full_name || '')
            setInstituteName(data.institute_name || '')
            setEducationLevel(data.education_level || 'Bachelors')
            setDegree(data.degree || '')
            setAcademicYear(data.academic_year || '')
            setPreviewUrl(data.avatar_url || '')
        } catch (err) {
            console.error('Error fetching profile:', err)
            setError('Could not load profile data.')
        } finally {
            setFetching(false)
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setAvatarFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            let avatarUrl = profile.avatar_url

            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop()
                const fileName = `${Math.random()}.${fileExt}`
                const filePath = `${user.id}/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('profiles')
                    .upload(filePath, avatarFile)

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from('profiles')
                    .getPublicUrl(filePath)

                avatarUrl = publicUrl
            }

            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    institute_name: instituteName,
                    education_level: educationLevel,
                    degree: degree,
                    academic_year: academicYear,
                    avatar_url: avatarUrl
                })
                .eq('id', user.id)

            if (updateError) throw updateError

            setSuccess(true)
            setTimeout(() => router.push('/dashboard/profile'), 1500)
        } catch (err) {
            console.error('Update error:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (fetching) return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="w-8 h-8 border-2 border-zinc-800 border-t-white rounded-full animate-spin"></div>
        </div>
    )

    return (
        <div className="pb-12 text-white">
            <Header
                title="Edit Identity"
                subtitle="MODIFY CORE NODE PARAMETERS"
            />

            <div className="max-w-2xl mx-auto mt-10">
                <form onSubmit={handleUpdate} className="space-y-8 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-3xl overflow-hidden bg-zinc-800 border-2 border-zinc-700 transition-all group-hover:border-white ring-offset-4 ring-offset-black transition-all">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl font-black text-zinc-600">
                                        {fullName?.[0]?.toUpperCase() || '?'}
                                    </div>
                                )}
                            </div>
                            <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center cursor-pointer hover:bg-zinc-200 transition-all shadow-xl">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>
                        <p className="mt-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Update Identification Graphic</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Full Identity</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-zinc-800/50 border border-zinc-800 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-white transition-all ring-0"
                                placeholder="Enter full name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Institute Node</label>
                            <input
                                type="text"
                                value={instituteName}
                                onChange={(e) => setInstituteName(e.target.value)}
                                className="w-full bg-zinc-800/50 border border-zinc-800 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-white transition-all ring-0"
                                placeholder="Institute Name"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Degree Level</label>
                            <select
                                value={educationLevel}
                                onChange={(e) => setEducationLevel(e.target.value)}
                                className="w-full bg-zinc-800/50 border border-zinc-800 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-white transition-all appearance-none cursor-pointer"
                            >
                                <option value="Bachelors">Bachelors</option>
                                <option value="Masters">Masters</option>
                                <option value="PhD">PhD</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Degree Program</label>
                            <input
                                type="text"
                                value={degree}
                                onChange={(e) => setDegree(e.target.value)}
                                className="w-full bg-zinc-800/50 border border-zinc-800 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-white transition-all ring-0"
                                placeholder="e.g. Computer Science"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Academic Cycle</label>
                        <input
                            type="text"
                            value={academicYear}
                            onChange={(e) => setAcademicYear(e.target.value)}
                            className="w-full bg-zinc-800/50 border border-zinc-800 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-white transition-all ring-0"
                            placeholder="e.g. 3rd Year"
                        />
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold tracking-widest uppercase italic">
                            Error: {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 text-xs font-bold tracking-widest uppercase italic">
                            Identity updated successfully. Redirecting...
                        </div>
                    )}

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 px-8 py-5 bg-zinc-800 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] hover:bg-zinc-700 transition-all border border-zinc-700"
                        >
                            Abort
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] px-8 py-5 bg-white text-black font-black rounded-2xl uppercase tracking-widest text-[10px] hover:bg-zinc-200 transition-all disabled:opacity-50"
                        >
                            {loading ? 'SYNCHRONIZING...' : 'Commit Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
