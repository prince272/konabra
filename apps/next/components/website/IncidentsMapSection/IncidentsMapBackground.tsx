export const IncidentsMapBackground = () => (
  <>
    <div className="bg-dots absolute inset-0 -z-10"></div>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,184,0,0.07),transparent_50%)]"></div>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(23,201,100,0.07),transparent_50%)]"></div>
    <div className="absolute -top-40 left-0 h-96 w-96 rounded-full bg-warning/5 blur-3xl"></div>
    <div className="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-success-500/5 blur-3xl"></div>
  </>
); 