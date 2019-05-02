const initialState = {
    drawIsCompleted: false,
    redrawIsCompleted: false
};

export default function draw(state = initialState, action) {
    switch (action.type) {
        case 'draw':
            return {
                ...state,
                drawIsCompleted: true
            };
        case 'clear':
            return {
                redrawIsCompleted: false,
                drawIsCompleted: false
            };
        case 'redraw':
            return {
                ...state,
                redrawIsCompleted: true
            };
        case 'unRedraw':
            return {
                ...state,
                redrawIsCompleted: false
            };
        default :
            return state;
    }
}
