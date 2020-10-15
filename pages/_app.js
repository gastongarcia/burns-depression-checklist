import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <div className="wrap m-10">
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
