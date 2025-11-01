import Footer from '@/app/components/Footer'
import Header from './Header'

export default function PolicyLayout({ children, title, lastUpdated }) {
    return (
        <div className="min-h-screen flex flex-col bg-neutral-900">
            <Header navItems={['Home','Apartments','Help']}/>
            <main className="flex-grow bg-neutral-900 py-8 mt-10">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-teal-400 mb-2">{title}</h1>
                            <p className="text-neutral-400">Last Updated: {lastUpdated}</p>
                        </div>

                        <div className="prose prose-lg max-w-none prose-headings:text-teal-400 prose-p:text-neutral-300 prose-strong:text-teal-300 prose-ul:text-neutral-300 prose-li:text-neutral-300 prose-a:text-teal-400 hover:prose-a:text-teal-300">
                            {children}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}