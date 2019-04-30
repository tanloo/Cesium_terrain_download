const initialState = {
    drawIsCompleted: false
};

export default function draw(state = initialState, action) {
    switch (action.type) {
        case 'draw':
            return {
                drawIsCompleted: true
            };
        case 'clear':
            return {
                drawIsCompleted: false
            };
        default :
            return state;
    }
}
