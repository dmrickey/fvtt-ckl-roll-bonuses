interface Canvas {
    tokens: TokenLayer;
}

interface TokenLayer {
    controlled: TokenPF[];
    placeables: TokenPF[];
}
