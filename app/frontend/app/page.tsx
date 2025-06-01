import Image from 'next/image'; // Keep if we plan to use Next/Image, otherwise remove
// We will add the ThemeSwitcher component later, likely in the Navbar

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="w-full max-w-4xl text-center py-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Welcome to Our Awesome Platform
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 mb-8">
          Discover amazing features and services that will boost your productivity.
        </p>
        <div className="flex justify-center space-x-4">
          <a
            href="/signup"
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Get Started
          </a>
          <a
            href="#features" // Assuming a features section will be added later
            className="px-8 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition-colors duration-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Placeholder for Features Section (to be designed) */}
      <section id="features" className="w-full max-w-4xl text-center py-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-12">
          Features
        </h2>
        {/* Feature items will go here */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Feature One</h3>
            <p className="text-gray-700 dark:text-gray-300">Description of feature one. It's really cool.</p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Feature Two</h3>
            <p className="text-gray-700 dark:text-gray-300">Description of feature two. It's even cooler.</p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Feature Three</h3>
            <p className="text-gray-700 dark:text-gray-300">Description of feature three. The coolest.</p>
          </div>
        </div>
      </section>

      {/* You can add more sections here: e.g., About Us, Testimonials, Contact */}

    </main>
  );
}
