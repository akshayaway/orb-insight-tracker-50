import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Ensure proper viewport meta tag for mobile
const viewportMeta = document.createElement('meta');
viewportMeta.name = 'viewport';
viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
document.head.appendChild(viewportMeta);

createRoot(document.getElementById("root")!).render(<App />);

// Register a basic service worker if supported (enables offline behavior / PWA)
if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker
			.register('/sw.js')
			.then((reg) => console.log('Service worker registered.', reg))
			.catch((err) => console.warn('Service worker registration failed:', err));
	});
}