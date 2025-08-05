import Content from "@/components/Content";
import Navbar from "@/components/Navbar";
import TableOfContents from "@/components/TableOfContents";
import type { DataResponse } from "@/types/data";

// Fetch json from the data endpoint
async function getData(): Promise<DataResponse> {
  const apiUrl = 'http://localhost:8000';
  
  try {
    const response = await fetch(`${apiUrl}/data`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    // Return empty array on error to prevent crash
    return [];
  }
}

export default async function Home() {
  const data = await getData();

  return (
    <div className="font-sans h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-4 pb-12 sm:p-6 max-w-7xl mx-auto">
          <div className="flex-1 min-w-0 max-w-4xl">
            <Content data={data} />
          </div>
          <div className="hidden lg:block w-74 flex-shrink-0">
            <TableOfContents data={data} />
          </div>
        </div>
      </main>
    </div>
  );
}
