import { getProjects } from "@/lib/admin-projects";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const projects = await getProjects();
        console.log("Projects fetched:", projects);
        return NextResponse.json({ projects });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
    }
}