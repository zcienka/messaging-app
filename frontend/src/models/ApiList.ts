export type ApiList<TypeGeneric> = {
    count: number
    next: string | null
    previous: string | null
    results: TypeGeneric[]
}

// export const initialApiList: ApiList<any> = {
//     count: 0,
//     next: null,
//     previous: null,
//     results: [],
// }
