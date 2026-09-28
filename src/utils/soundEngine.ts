class SoundEngine {
    private enabled: boolean = true;
    private sounds: Record<string, HTMLAudioElement> = {};

    constructor() {
        // Enregistrement des sons (utilisant des URLs de sons libres de droit ou synthétisés)
        this.sounds = {
            'click': new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'),
            'dice': new Audio('https://assets.mixkit.co/active_storage/sfx/2045/2045-preview.mp3'),
            'hit': new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'),
            'miss': new Audio('https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3'),
            'hacking': new Audio('https://assets.mixkit.co/active_storage/sfx/2558/2558-preview.mp3'),
            'victory': new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3')
        };

        // Configuration volume
        Object.values(this.sounds).forEach(s => s.volume = 0.3);
    }

    play(name: string) {
        if (!this.enabled || !this.sounds[name]) return;
        this.sounds[name].currentTime = 0;
        this.sounds[name].play().catch(() => {}); // Éviter erreurs si non-interagi
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

export const soundEngine = new SoundEngine();
