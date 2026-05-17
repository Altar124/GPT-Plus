export default async function handler(req, res) {
    // 1. Pastikan hanya menerima request POST
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { session } = req.body;

        if (!session) {
            return res.status(400).json({ success: false, error: 'Session kosong' });
        }

        // 2. Parsing Session JSON yang dikirim user
        let parsedSession;
        try {
            parsedSession = typeof session === 'string' ? JSON.parse(session) : session;
        } catch (e) {
            return res.status(400).json({ success: false, error: 'Format JSON session tidak valid' });
        }

        // 3. Ambil Access Token
        // Biasanya token ada di properti accessToken
        const accessToken = parsedSession.accessToken;
        
        if (!accessToken) {
            return res.status(400).json({ success: false, error: 'Access Token tidak ditemukan di dalam session' });
        }

        /* ============================================================
        4. CALL KE API INTERNAL / TARGET
        Di bawah ini adalah contoh bagaimana backend mengirim request 
        ke sebuah endpoint menggunakan token yang sudah didapat.
        
        Catatan: Endpoint 'https://api.openai.com/v1/internal/checkout' 
        adalah contoh. Endpoint aslinya selalu disembunyikan/berubah.
        ============================================================
        */

        const openAiResponse = await fetch('https://api.openai.com/v1/internal/checkout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`, // Menggunakan token dari session
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' // Kadang API memblokir request tanpa User-Agent
            },
            body: JSON.stringify({
                plan: "plus",
                currency: "IDR"
            })
        });

        // Cek jika API menolak request (misal: token expired atau endpoint salah)
        if (!openAiResponse.ok) {
            const errorData = await openAiResponse.text();
            throw new Error(`API Error: ${openAiResponse.status} - ${errorData}`);
        }

        // 5. Ambil data dari server target
        const targetData = await openAiResponse.json();

        // 6. Kembalikan URL checkout ke Frontend
        return res.status(200).json({
            success: true,
            url: targetData.checkout_url || "https://pay.openai.com/c/pay/default_url",
            promoEligible: targetData.is_eligible || false,
            account: {
                email: parsedSession.user?.email || "Email tidak terbaca",
                name: parsedSession.user?.name || "User",
                plan_type: "free"
            }
        });

    } catch (error) {
        console.error('Backend Process Error:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Gagal memproses data dari server target. Pastikan session masih aktif.' 
        });
    }
}
