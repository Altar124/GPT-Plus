export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { session } = req.body;

        if (!session) {
            return res.status(400).json({ success: false, error: 'Session kosong' });
        }

        let parsedSession;
        try {
            parsedSession = typeof session === 'string' ? JSON.parse(session) : session;
        } catch (e) {
            return res.status(400).json({ success: false, error: 'Format JSON session tidak valid' });
        }

        // Memastikan token ada di dalam session
        const accessToken = parsedSession.accessToken;
        if (!accessToken) {
            return res.status(400).json({ success: false, error: 'Access Token tidak ditemukan di dalam session' });
        }

        // Simulasi loading 1.5 detik seolah-olah sedang menghubungi server target
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Langsung kembalikan respons sukses dengan link checkout buatan (dummy)
        return res.status(200).json({
            success: true,
            url: "https://pay.openai.com/c/pay/contoh_link_checkout_javasia24",
            promoEligible: true,
            account: {
                // Mengambil nama dan email langsung dari session JSON yang di-paste user
                email: parsedSession.user?.email || "email_terdeteksi@javasia24.com",
                name: parsedSession.user?.name || "Pengguna JAVASIA24",
                plan_type: "free"
            }
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, error: 'Terjadi kesalahan di server backend' });
    }
}
