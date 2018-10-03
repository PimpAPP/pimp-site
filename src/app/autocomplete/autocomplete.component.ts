import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-autocomplete',
    templateUrl: 'autocomplete.component.html'
})
export class AutocompleteComponent implements OnInit {

    @Input() 
    public customId: string;
    public isFocused: Boolean = false;
    public loading: Boolean = false;
    public showBox: Boolean = false;
    public suggestedItems = [];
    public search: string = '';
    private minLength = 3;
    private maxSuggestions = 10;
    public param: '';

    constructor() { 

    }

    ngOnInit() {
        // EventEmitterService.get('setSearchTextInNav').subscribe(data => {
        //     this.search = data;
        // });
    }

    onChange(newValue) {
        if (this.isFocused && this.search.length >= this.minLength) {
            this.showBox = true;
            this.doSearch();
        } else {
            this.showBox = false;
        }
    }

    doSearch() {
        this.loading = true;
        this.suggestedItems = [];
        var found = 0;
        this.search = this.search.toLowerCase();

        // for (let country in this.countryProvider.countrysLikeDatabase) {
        //     if (country.startsWith(this.search)) {
        //         this.suggestedItems.push({ suggested: country, original: country });
        //         found++;
        //         continue;
        //     }

        //     var list = this.countryProvider.countrysLikeDatabase[country];
        //     for (let i in list) {
        //         let item = list[i];
        //         if (item.startsWith(this.search)) {
        //             this.suggestedItems.push({ suggested: item, original: country});
        //             found++;
        //             continue;
        //         }
        //     }

        //     if (found >= this.maxSuggestions) {
        //         break;
        //     }
        // }

        this.loading = false;
    }

    focusOut() {
        setTimeout(()=> {
            this.showBox = false;
        }, 500);
    }

    onSelect(item) {
        this.search = item.suggested;
        this.showBox = false;
        // this.SchoolsProvider.searchedCountry = item;
        // EventEmitterService.get('setSearchItem').emit(item);
    }

}
