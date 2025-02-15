export class CustomDropDown {
    private option;
    private name;
    private id;
    private container: HTMLElement;

    constructor(option: string, name: string, id: string) {
        this.option = option;
        this.name = name
        this.id = id
        this.container = document.createElement('div');
        this.container.id = 'stock-search-result';
        this.container.classList = "w-full p-4 text-xl md:text-2xl border-l-2 border-r-2 border-b-2 border-black text-center sm:text-left bg-white transition-all duration-200 hover:translate-x-1 hover:translate-y-1 hover:bg-pink-100 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-within:translate-x-1 focus-within:translate-y-1 focus-within:bg-pink-100 focus-within:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        this.render();
    }

    private render() {
        this.container.innerHTML = `
            <div class="flex justify-between items-center px-2 outline-none" data-id="${this.id}" tabindex="0">
                <span class="font-bold">${this.option}</span>
                <span class="text-gray-600 group-hover:text-gray-800">${this.name?.length > 20 ? this.name?.substring(0, 20) + "..." : this.name}</span>
            </div>
        `
    }

    public getDiv() {
        return this.container;
    }
}
