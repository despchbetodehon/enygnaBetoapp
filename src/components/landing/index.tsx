import Pagina from "../template/Pagina";
import Cabecalho from "./cabecalho";
import Depoimentos from "./depoimentos";
import Rodape from "./rodape";


// Hero Section Component
const HeroSection = () => {
    return (
        <section 
            id="home" 
            style={{
                opacity: 1,
                transform: 'none',
                padding: '20px 16px 40px',
                paddingTop: '80px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                minHeight: '60vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '24px',
                position: 'relative',
                marginTop: '0'
            }}
        >
            <img 
                src="/betologo.jpg" 
                alt="Beto Dehon Hero" 
                style={{
                    opacity: 1,
                    transform: 'none',
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '4px solid #1a4a3a',
                    boxShadow: '0 8px 32px rgba(26, 74, 58, 0.3)',
                    marginBottom: '20px'
                }}
            />
            <h1 style={{
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                fontWeight: 700,
                color: '#1a4a3a',
                fontFamily: '"Playfair Display", "Georgia", serif',
                margin: '0 0 16px 0',
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}>
                Despachante Beto Dehon
            </h1>
            <p style={{
                fontSize: 'clamp(1rem, 3vw, 1.3rem)',
                color: '#666',
                lineHeight: 1.6,
                maxWidth: '600px',
                margin: '0 0 32px 0',
                fontWeight: 400,
                padding: '0 20px'
            }}>
                Atendimento ágil, confiável e 100% digital.<br />
                Somos especialistas em documentação veicular no Brasil e no exterior.
            </p>
            <a 
                href="https://wa.me/5548999990000" 
                target="_blank" 
                rel="noopener" 
                aria-label="Chamar no WhatsApp"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px 32px',
                    backgroundColor: '#25D366',
                    color: '#ffffff',
                    textDecoration: 'none',
                    borderRadius: '50px',
                    fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 16px rgba(37, 211, 102, 0.3)',
                    border: 'none',
                    cursor: 'pointer'
                }}
            >
                Fale Conosco no WhatsApp
            </a>
        </section>
    );
};

export default function Landing() {
    return (
        <Pagina externa>
            <Cabecalho />
            
            <HeroSection />
            <Depoimentos/>
            <Rodape />
        </Pagina>
    );
}