export interface Persist {
    version: number,
    rehydrated: boolean,
}

export interface PersistProfile {
    auth: string,
    _persist: string,
}
