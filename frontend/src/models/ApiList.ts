export type ApiList<TypeGeneric> = {
    count: number;
    next: string;
    previous: string;
    results: TypeGeneric[];
};
