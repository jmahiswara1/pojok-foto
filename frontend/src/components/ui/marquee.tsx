export default function Marquee({ items }: { items: string[] }) {
  return (
    <div className="relative flex w-full overflow-x-hidden border-y-3 border-black bg-black text-white">
      <div className="animate-marquee whitespace-nowrap py-4">
        {items.map((item, index) => {
          return (
            <span key={index} className="mx-8 text-2xl font-black uppercase tracking-widest">
              • {item}
            </span>
          )
        })}
      </div>

      <div className="absolute top-0 animate-marquee2 whitespace-nowrap py-4">
        {items.map((item, index) => {
          return (
            <span key={`clone-${index}`} className="mx-8 text-2xl font-black uppercase tracking-widest">
              • {item}
            </span>
          )
        })}
      </div>
    </div>
  )
}
