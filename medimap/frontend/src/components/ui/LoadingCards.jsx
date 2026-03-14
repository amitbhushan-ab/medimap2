export default function LoadingCards({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="skeleton w-11 h-11 rounded-xl" />
              <div>
                <div className="skeleton h-4 w-36 mb-2" />
                <div className="skeleton h-3 w-24" />
              </div>
            </div>
            <div>
              <div className="skeleton h-8 w-16 mb-1" />
              <div className="skeleton h-3 w-12" />
            </div>
          </div>
          <div className="flex gap-2 mb-4">
            <div className="skeleton h-6 w-20 rounded-full" />
            <div className="skeleton h-6 w-20 rounded-full" />
          </div>
          <div className="skeleton h-10 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}