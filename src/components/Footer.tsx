import Link from 'next/link';

export default function Footer() {
  return (
    <footer id="contact">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h3>Destin Vacations</h3>
            <p>Your trusted Destination Management Company in Kerala. We provide end-to-end travel solutions for unforgettable experiences.</p>
            <div className="social-links">
              <a href="#" aria-label="Facebook"><i className="fa-brands fa-facebook-f"></i></a>
              <a href="#" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
              <a href="#" aria-label="WhatsApp"><i className="fa-brands fa-whatsapp"></i></a>
              <a href="#" aria-label="YouTube"><i className="fa-brands fa-youtube"></i></a>
            </div>
          </div>
          <div className="footer-col">
            <h3>Quick Links</h3>
            <div className="footer-links">
              <a href="#home">Home</a>
              <a href="#destinations">Destinations</a>
              <a href="#services">Services</a>
              <a href="#contact">Contact</a>
            </div>
          </div>
          <div className="footer-col">
            <h3>Destinations</h3>
            <div className="footer-links">
              <a href="/destination.html?id=munnar">Munnar</a>
              <a href="/destination.html?id=alleppey">Alleppey</a>
              <a href="/destination.html?id=wayanad">Wayanad</a>
              <a href="/destination.html?id=varkala">Varkala</a>
              <a href="/destination.html?id=cochin">Cochin</a>
              <a href="/destination.html?id=thekkady">Thekkady</a>
            </div>
          </div>
          <div className="footer-col">
            <h3>Contact Us</h3>
            <p><i className="fa-solid fa-phone"></i> +91 95268 86600</p>
            <p><i className="fa-solid fa-envelope"></i> Sales@destin.in</p>
            <p><i className="fa-solid fa-location-dot"></i> Kerala, India</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Destin Vacations. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
