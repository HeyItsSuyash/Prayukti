import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
        const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
        const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

        let siteViews = 0;
        let clicks = 0;
        let loggedInAccounts = 0;
        let experimentsMade = 0;

        // 1. Fetch from Vercel Web Analytics API if credentials are provided
        if (VERCEL_TOKEN && VERCEL_PROJECT_ID) {
            try {
                // Fetch site views (pageviews) for the last 30 days
                const now = new Date();
                const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                
                const url = `https://api.vercel.com/v1/query/web-analytics/visits/aggregate?projectId=${VERCEL_PROJECT_ID}&since=${thirtyDaysAgo.toISOString()}&until=${now.toISOString()}&by=date`;
                
                const res = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${VERCEL_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    // Aggregate pageviews and visitors
                    let totalPageviews = 0;
                    let totalVisitors = 0;
                    
                    if (data.data && Array.isArray(data.data)) {
                        for (const item of data.data) {
                            totalPageviews += item.pageviews || 0;
                            totalVisitors += item.visitors || 0;
                        }
                    }
                    
                    siteViews = totalPageviews;
                    // For "clicks", we will fallback to tracking total visitors as a proxy if custom events aren't setup
                    clicks = totalVisitors;
                } else {
                    console.error("Failed to fetch Vercel Analytics", await res.text());
                }
            } catch (err) {
                console.error("Error fetching Vercel Analytics", err);
            }
        } else {
            console.warn("VERCEL_TOKEN or VERCEL_PROJECT_ID not set. Showing 0 for Site Views and Clicks.");
        }

        // 2. Fetch from Rust Backend API
        try {
            const dbRes = await fetch(`${BACKEND_URL}/api/public-metrics`);
            if (dbRes.ok) {
                const dbData = await dbRes.json();
                loggedInAccounts = dbData.total_users || 0;
                experimentsMade = dbData.total_experiments || 0;
            } else {
                console.error("Failed to fetch backend metrics", await dbRes.text());
            }
        } catch (err) {
            console.error("Error fetching backend metrics", err);
        }

        return NextResponse.json({
            siteViews,
            clicks,
            loggedInAccounts,
            experimentsMade
        });
    } catch (error) {
        console.error("Error in /api/metrics:", error);
        return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
    }
}
