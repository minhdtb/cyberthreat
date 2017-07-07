interface Terminal {
    echo(v1: any): void;
}

interface JQuery {
    vectorMap(options: any): void;
    vectorMap(v1: any, v2: any, v3: any): void;
    terminal(v1: any, v2: any): Terminal;
}
