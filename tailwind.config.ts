module.exports = {
    content: [
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                background: '#0B0F1A',
                card: '#1F2A3B',
                border: '#2B3A50',
                primaryText: '#E5E5E5',
                secondaryText: '#A1AAB8',
                disabled: '#6C7380',
                primaryBlue: '#1DAEFF',
                primaryCyan: '#00D2FF',
                accentOrange: '#FF6C1D',
                successGreen: '#00C781',
                warningYellow: '#FFB020',
                errorRed: '#FF4D4F',
            },
            gradientColorStops: {
                'accent-gradient': ['#1DAEFF', '#00D2FF', '#FF6C1D'],
            },
        },
    },
    plugins: [],
};