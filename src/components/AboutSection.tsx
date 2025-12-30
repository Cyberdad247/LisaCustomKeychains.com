
import Image from 'next/image';

export default function AboutSection() {
  return (
    <section className="py-24 bg-rose-50 border-t border-b border-rose-100">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        
        {/* TEXT CONTENT */}
        <div className="space-y-6">
          <h2 className="text-4xl font-serif text-slate-900">Meet the Maker</h2>
          <div className="w-16 h-1 bg-purple-600 rounded-full"></div>
          <p className="text-lg text-slate-700 leading-relaxed font-sans">
            Hi, I'm Lisa! Welcome to my creative corner.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Every keychain in this shop is hand-woven by me with care and attention to detail. 
            What started as a small hobby has grown into a passion for creating personalized, 
            colorful accessories that brighten up your daily life.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Whether you're looking for a simple splash of color or a custom name tag for your 
            backpack, I put my heart into every knot. Thank you for supporting handmade!
          </p>
          <div className="pt-4 font-serif text-2xl text-purple-800 italic">
            "Every Knot Tells a Story."
          </div>
        </div>

        {/* IMAGE */}
        <div className="relative h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700 ease-out border-8 border-white">
          <Image
            src="/images/Lisa'sSelfie.jpg"
            alt="Lisa - The Maker"
            fill
            className="object-cover"
            priority
          />
        </div>

      </div>
    </section>
  );
}
