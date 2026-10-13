// Склеивает имена классов, пропуская пустые значения.
export default function cx() {
    const classes = [];
    for (let i = 0; i < arguments.length; i++) {
        if (arguments[i]) classes.push(arguments[i]);
    }
    return classes.join(' ');
}
