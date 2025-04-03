

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 rtl">
      

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center mb-6">
          <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse mr-2"></div>
          <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        <div className="mb-6 bg-white rounded-lg p-6 shadow-sm">
          <div className="h-6 w-40 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 rounded-lg animate-pulse mb-6"></div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="w-full md:w-48 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="h-6 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-4 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                </div>
                <div className="mt-3 md:mt-0">
                  <div className="h-4 w-16 bg-gray-200 rounded-lg animate-pulse mb-1"></div>
                  <div className="h-6 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      
    </div>
  )
}

