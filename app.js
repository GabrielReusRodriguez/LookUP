/*
 * Catsalut LookUP
 * Copyright (C) 2026 Gabriel Reus
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const app = {
    // Config
    state: {
        allData: [],
        filteredData: [],
        currentPage: 1,
        itemsPerPage: 50,
        filters: {
            search: '',
            type: '',
            subtype: ''
        },
        isLoading: true
    },

    // DOM Elements
    elements: {
        tableBody: document.getElementById('tableBody'),
        searchInput: document.getElementById('searchInput'),
        filterType: document.getElementById('filterType'),
        filterSubtype: document.getElementById('filterSubtype'),
        prevBtn: document.getElementById('prevBtn'),
        nextBtn: document.getElementById('nextBtn'),
        pageNumbers: document.getElementById('pageNumbers'),
        startRange: document.getElementById('startRange'),
        endRange: document.getElementById('endRange'),
        totalItems: document.getElementById('totalItems'),
        itemsPerPageSelect: document.getElementById('itemsPerPageSelect'),
        loadingState: document.getElementById('loadingState'),
        noResults: document.getElementById('noResults'),
        errorState: document.getElementById('errorState'),
        fileInput: document.getElementById('fileInput'),
        manualLoadBtn: document.getElementById('manualLoadBtn'),
        statusIndicator: document.getElementById('status-indicator'),
        // Modal Elements
        helpBtn: document.getElementById('helpBtn'),
        closeHelpBtn: document.getElementById('closeHelpBtn'),
        helpModal: document.getElementById('helpModal')
    },

    init: async function () {
        this.bindEvents();

        // Attempt automatic download
        try {
            this.updateStatus('Descarregant dades...', 'loading');
            await this.fetchAndProcessZip();
        } catch (error) {
            console.warn("Auto-download failed:", error);
            this.updateStatus('Error de descàrrega automàtica', 'error');
            this.showError('No s\'ha pogut descarregar el fitxer automàticament (possible CORS). Si us plau, descarrega el ZIP manualment i puja\'l aquí.');
        }
    },

    bindEvents: function () {
        // Modal Logic
        this.elements.helpBtn.addEventListener('click', () => {
            this.elements.helpModal.classList.remove('hidden');
        });

        this.elements.closeHelpBtn.addEventListener('click', () => {
            this.elements.helpModal.classList.add('hidden');
        });

        this.elements.helpModal.addEventListener('click', (e) => {
            if (e.target === this.elements.helpModal) {
                this.elements.helpModal.classList.add('hidden');
            }
        });

        // Search
        this.elements.searchInput.addEventListener('input', (e) => {
            this.state.filters.search = e.target.value.toLowerCase();
            this.state.currentPage = 1;
            this.filterData();
        });

        // Type Filter
        this.elements.filterType.addEventListener('change', (e) => {
            this.state.filters.type = e.target.value;
            this.state.filters.subtype = ''; // Reset sub-type when type changes
            this.state.currentPage = 1;
            this.populateSubtypeFilter(); // Re-populate subtypes
            this.filterData();
        });

        // Subtype Filter
        this.elements.filterSubtype.addEventListener('change', (e) => {
            this.state.filters.subtype = e.target.value;
            this.state.currentPage = 1;
            this.filterData();
        });

        // Items Per Page
        this.elements.itemsPerPageSelect.addEventListener('change', (e) => {
            this.state.itemsPerPage = parseInt(e.target.value);
            this.state.currentPage = 1;
            this.renderTable();
        });

        // Pagination
        this.elements.prevBtn.addEventListener('click', () => {
            if (this.state.currentPage > 1) {
                this.state.currentPage--;
                this.renderTable();
            }
        });

        this.elements.nextBtn.addEventListener('click', () => {
            const maxPages = Math.ceil(this.state.filteredData.length / this.state.itemsPerPage);
            if (this.state.currentPage < maxPages) {
                this.state.currentPage++;
                this.renderTable();
            }
        });

        // Manual Upload
        this.elements.manualLoadBtn.addEventListener('click', () => {
            this.elements.fileInput.click();
        });

        this.elements.fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.processZipFile(file);
            }
        });
    },

    fetchAndProcessZip: async function () {
        // NOTE: This URL might fail due to CORS. 
        // If we were in a backend env we'd proxy it. 
        // Here we rely on the user manual fallback if it fails.
        const url = 'https://catsalut.gencat.cat/web/.content/minisite/catsalut/proveidors_professionals/registres_catalegs/catalegs/territorials-unitats-proveidores/cataleg-up.zip';

        // In local dev without proxy, this will likely fail.
        // We simulate a fetch, if it throws, we catch it.
        const response = await fetch(url);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const blob = await response.blob();
        await this.processZipFile(blob);
    },

    processZipFile: async function (blob) {
        this.updateStatus('Descomprimint ZIP...', 'loading');
        this.elements.loadingState.classList.remove('hidden');
        this.elements.errorState.classList.add('hidden');
        this.elements.noResults.classList.add('hidden');

        try {
            const zip = await JSZip.loadAsync(blob);

            // Look for the correct file
            const fileName = Object.keys(zip.files).find(name => name.includes('.txt'));

            if (!fileName) {
                throw new Error("No s'ha trobat el fitxer TXT dins del ZIP.");
            }

            const content = await zip.files[fileName].async('string');
            this.parseData(content);

        } catch (error) {
            console.error(error);
            this.showError('Error processant el fitxer ZIP: ' + error.message);
            this.updateStatus('Error de processament', 'error');
        }
    },

    parseData: function (csvText) {
        this.updateStatus('Processant dades...', 'loading');

        const lines = csvText.split('\n');
        const data = [];

        // Skip header (line 0)
        // Format based on inspection:
        // 0: codi EP
        // 1: descripció EP
        // 2: codi tipus UP
        // 3: descripció tipus UP
        // 4: codi subtipus UP
        // 5: descripció subtipus UP
        // 6: codi UP
        // 7: descripció UP

        // Note: The file uses '; ' or ';' as delimiter? 
        // Based on `head` output: 0009;Ajuntament Santa Coloma...

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const parts = line.split(';');

            // Safety check for length
            if (parts.length < 3) continue;

            const entry = {
                codiEP: parts[0]?.trim(),
                descEP: parts[1]?.trim(),
                codiTipus: parts[2]?.trim(),
                descTipus: parts[3]?.trim(),
                codiSubtipus: parts[4]?.trim(),
                descSubtipus: parts[5]?.trim(),
                codiUP: parts[6]?.trim(),
                descUP: parts[7]?.trim(),
                // Extra info if available (sometimes at end)
                rest: parts.slice(8).join(' ')
            };

            data.push(entry);
        }

        this.state.allData = data;
        this.state.filteredData = data;
        this.populateTypeFilter();
        this.populateSubtypeFilter();
        this.filterData();

        this.updateStatus('Dades carregades', 'success');
        this.elements.loadingState.classList.add('hidden');
    },

    populateTypeFilter: function () {
        const types = new Set(this.state.allData.map(item => item.descTipus).filter(Boolean));
        const sortedTypes = Array.from(types).sort();

        this.elements.filterType.innerHTML = '<option value="">Tots els tipus</option>';
        sortedTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            this.elements.filterType.appendChild(option);
        });
    },

    populateSubtypeFilter: function () {
        const selectedType = this.state.filters.type;
        const subtypes = new Set(
            this.state.allData
                .filter(item => !selectedType || item.descTipus === selectedType)
                .map(item => item.descSubtipus)
                .filter(Boolean)
        );
        const sortedSubtypes = Array.from(subtypes).sort();

        this.elements.filterSubtype.innerHTML = '<option value="">Tots els subtipus</option>';
        sortedSubtypes.forEach(subtype => {
            const option = document.createElement('option');
            option.value = subtype;
            option.textContent = subtype;
            this.elements.filterSubtype.appendChild(option);
        });
    },

    filterData: function () {
        const { search, type, subtype } = this.state.filters;

        this.state.filteredData = this.state.allData.filter(item => {
            const matchesSearch =
                (item.descUP?.toLowerCase().includes(search) || '') ||
                (item.codiUP?.toLowerCase().includes(search) || '') ||
                (item.descEP?.toLowerCase().includes(search) || '');

            const matchesType = type === '' || item.descTipus === type;
            const matchesSubtype = subtype === '' || item.descSubtipus === subtype;

            return matchesSearch && matchesType && matchesSubtype;
        });

        this.renderTable();
    },

    renderTable: function () {
        let { filteredData, currentPage, itemsPerPage } = this.state;

        // Force 25 items on mobile
        if (window.innerWidth <= 768) {
            itemsPerPage = 25;
        }

        // Calculate range
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedItems = filteredData.slice(start, end);

        // Update UI info
        this.elements.startRange.textContent = filteredData.length > 0 ? start + 1 : 0;
        this.elements.endRange.textContent = Math.min(end, filteredData.length);
        this.elements.totalItems.textContent = filteredData.length;

        // Clear table
        this.elements.tableBody.innerHTML = '';

        if (paginatedItems.length === 0) {
            this.elements.noResults.classList.remove('hidden');
        } else {
            this.elements.noResults.classList.add('hidden');

            paginatedItems.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="font-mono text-sm">${item.codiUP}</td>
                    <td class="font-bold">${item.descUP}</td>
                    <td><span class="badge badge-type">${item.descTipus}</span></td>
                    <td class="text-sm text-muted">${item.descSubtipus || '-'}</td>
                    <td class="text-sm">${item.descEP}</td>
                `;
                this.elements.tableBody.appendChild(tr);
            });
        }

        this.renderPagination();
    },

    renderPagination: function () {
        const totalPages = Math.ceil(this.state.filteredData.length / this.state.itemsPerPage);

        this.elements.prevBtn.disabled = this.state.currentPage === 1;
        this.elements.nextBtn.disabled = this.state.currentPage === totalPages || totalPages === 0;

        // Render page numbers (simplified logic for brevity: First ... Current ... Last)
        let html = '';

        // Always show current page
        html += `<div class="page-dot active">${this.state.currentPage}</div>`;

        this.elements.pageNumbers.innerHTML = html;
    },

    updateStatus: function (text, type) {
        let icon = 'fa-circle-notch fa-spin';
        if (type === 'success') icon = 'fa-check';
        if (type === 'error') icon = 'fa-circle-exclamation';

        this.elements.statusIndicator.innerHTML = `<i class="fa-solid ${icon}"></i> ${text}`;

        if (type === 'error') {
            this.elements.statusIndicator.style.color = 'var(--danger)';
        } else if (type === 'success') {
            this.elements.statusIndicator.style.color = 'var(--success)';
        } else {
            this.elements.statusIndicator.style.color = 'var(--text-muted)';
        }
    },

    showError: function (msg) {
        this.elements.loadingState.classList.add('hidden');
        this.elements.errorState.classList.remove('hidden');
        document.getElementById('errorMessage').textContent = msg;
    },

    retryDownload: function () {
        this.elements.errorState.classList.add('hidden');
        this.init();
    }
};

// Start
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
