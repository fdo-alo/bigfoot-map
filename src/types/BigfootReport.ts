export interface BigfootReport {
    number: number;
    title: string | null;
    date: string | null;
    state: string;
    county: string;
    season: string;
    classification: "Class A" | "Class B" | "Class C";
    observed: string | null;
    location_details?: string | null;
}