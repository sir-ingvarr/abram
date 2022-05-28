class ManTwo extends Man {
    constructor(params) {
        super(params);
        this.name = 'Man2';
    }

    CheckHorizontalInputs() {
        if(InputSystem.KeyPressed('ArrowLeft')) return -1;
        if(InputSystem.KeyPressed('ArrowRight')) return 1;
        return 0;
    }

    CheckVerticalInputs() {
        if(InputSystem.KeyPressed('ArrowUp')) return -1;
        if(InputSystem.KeyPressed('ArrowDown')) return 1;
        return 0;
    }

    Update() {
        super.Update();
    }
}
