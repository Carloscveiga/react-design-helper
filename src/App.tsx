import { EditHelper } from './components/EditHelper'

function App() {
  return (

    <>
      <section className="relative w-full min-h-screen bg-white flex items-center justify-center border-b border-gray-200">

        <EditHelper />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
            Build Something Amazing
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 mb-10 max-w-3xl mx-auto">
            This is a generic hero section. You can easily customize the text, styles, and layout to match your brand and start converting visitors today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-md shadow hover:bg-indigo-700 transition">
              Get Started
            </button>
            <button className="px-8 py-3 bg-gray-100 text-gray-700 font-semibold rounded-md hover:bg-gray-200 transition">
              Learn More
            </button>
          </div>
        </div>
      </section>

      <section className="relative w-full min-h-screen bg-white flex items-center justify-center border-b border-gray-200">
        <EditHelper />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center bg-blue-700">
          <p className="text-xl md:text-2xl text-gray-500 mb-10 max-w-3xl mx-auto">
            This is a generic hero section. You can easily customize the text, styles, and layout to match your brand and start converting visitors today.
          </p>
        </div>
      </section>



    </>
  )
}

export default App
