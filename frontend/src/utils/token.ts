export interface TokenAuth {
    access: string | null,
    refresh: string | null,
    loading: 'idle' | 'pending' | 'succeeded' | 'failed'
}