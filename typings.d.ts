interface Terminal {
    echo(v1: any): void;
}

interface JQuery {
    terminal(v1: any, v2: any): Terminal;
    draggable(options?: any): void
}
