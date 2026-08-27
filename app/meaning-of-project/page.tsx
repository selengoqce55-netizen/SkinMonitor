export default function MeaningOfProject() {
  return (
    <main className="min-h-screen bg-[#FFF5F9] text-[#480A23] px-6 py-12">

      <section className="mx-auto max-w-4xl">

        <h1 className="text-center text-5xl font-semibold">
          Meaning of Project
        </h1>

        <div className="mt-12 rounded-3xl bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-semibold">
            About SkinMonitor
          </h2>

          <p className="mt-5 leading-8 text-[#480A23]/80">
            SkinMonitor is a personal tool designed to help 
            users map and monitor changes in their moles over 
            time. By allowing users to record characteristics 
            such as diameter, shape, symmetry, border, colour 
            and elevation, the project aims to make changes easier
            to track and recognise. The project also explores UV
            exposure monitoring, as ultraviolet (UV) radiation 
            is an important environmental risk factor associated
            with skin cancer. Collecting and visualising UV exposure
            data can provide additional context for understanding skin
            health over time and contribute to more informed monitoring and awareness.
    
          </p>

          <p className="mt-5 leading-8 text-[#480A23]/80">
            Monitoring changes in moles is important because changes in their
            characteristics can be relevant when assessing skin health.
            SkinMonitor is designed as a tracking and awareness tool rather
            than a diagnostic system, encouraging users to keep organised
            records that can support conversations with healthcare
            professionals.
          </p>

          <p className="mt-5 leading-8 text-[#480A23]/80">
            The project also explores how digital tools and wearable
            technology could contribute to skin-health awareness. Future
            development includes integrating UV exposure data from a wearable
            device to help users understand their exposure and maintain a
            more complete record.
          </p>

        </div>

        <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-semibold">
            Project Aim
          </h2>

          <p className="mt-5 leading-8 text-[#480A23]/80">
            The aim of SkinMonitor is to provide a simple and accessible way of monitoring and organising
            mole records, identifying changes between observations and
            exploring how personal data can be used to support preventative
            health awareness about skin cancer.
          </p>

        </div>

        <div className="mt-8 rounded-3xl bg-[#480A23] p-8 text-white">

          <h2 className="text-2xl font-semibold">
            Project Creator
          </h2>

          <p className="mt-4 text-lg text-white/80">
            Selen Gökçe
          </p>

        </div>

      </section>

    </main>
  );
}