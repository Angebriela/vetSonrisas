// mode: 'create' o 'edit'. createOnly = solo al crear (p. ej. la contraseña); editOnly = solo al editar
export function renderFormFields(resource, row = {}, { resources, relationCache, relationLabel, rawFieldValue, escapeHtml, mode = 'create' }) {
    const isEditing = mode === 'edit';
    return resource.fields.filter((field) => !field.listOnly && !(isEditing && field.createOnly) && !(!isEditing && field.editOnly)).map((field) => {
        const rawValue = rawFieldValue(row, field);
        const value = rawValue === '' && field.defaultValue !== undefined ? field.defaultValue : rawValue;
        const required = field.required ? 'required' : '';
        const fieldId = `field-${field.name}`;
        if (field.type === 'checkbox') return `<label class="checkbox-field"><input id="${fieldId}" name="${field.name}" type="checkbox" ${value === true || (value === '' && field.defaultValue) ? 'checked' : ''}><span>${field.label}</span></label>`;
        if (field.type === 'select') {
            const options = field.options
                ? field.options.map((option) => {
                    const optionValue = typeof option === 'string' ? option : option.value;
                    const optionLabel = typeof option === 'string' ? option : option.label;
                    return `<option value="${escapeHtml(optionValue)}" ${String(optionValue) === String(value) ? 'selected' : ''}>${escapeHtml(optionLabel)}</option>`;
                }).join('')
                : (relationCache[field.relation] || []).map((item) => {
                    const id = item[resources[field.relation].idField];
                    return `<option value="${escapeHtml(id)}" ${String(id) === String(value) ? 'selected' : ''}>${escapeHtml(relationLabel(item, field.relation))}</option>`;
                }).join('');
            return `<div class="form-field"><label for="${fieldId}">${field.label}${field.required ? ' *' : ''}</label><select id="${fieldId}" name="${field.name}" ${required}><option value="">Selecciona una opción</option>${options}</select></div>`;
        }
        const tag = field.type === 'textarea' ? 'textarea' : 'input';
        const attributes = tag === 'textarea' ? '' : `type="${field.type}" ${field.step ? `step="${field.step}"` : ''}`;
        if (tag === 'textarea') return `<div class="form-field wide-field"><label for="${fieldId}">${field.label}${field.required ? ' *' : ''}</label><textarea id="${fieldId}" name="${field.name}" ${required}>${escapeHtml(value)}</textarea></div>`;
        const extraAttributes = [
            field.maxLength ? `maxlength="${field.maxLength}"` : '',
            field.minLength ? `minlength="${field.minLength}"` : '',
            field.type === 'password' ? 'autocomplete="new-password"' : '',
            field.inputMode ? `inputmode="${field.inputMode}"` : '',
            field.pattern ? `pattern="${field.pattern}"` : '',
            field.className ? `class="${field.className}"` : '',
            field.readOnly ? 'readonly' : '',
        ].filter(Boolean).join(' ');
        return `<div class="form-field"><label for="${fieldId}">${field.label}${field.required ? ' *' : ''}</label><input id="${fieldId}" name="${field.name}" value="${escapeHtml(value)}" ${attributes} ${extraAttributes} ${required}></div>`;
    }).join('');
}

export function readResourcePayload(form, resource) {
    const payload = {};
    resource.fields.forEach((field) => {
        if (field.listOnly) return;
        const input = form.elements[field.name];
        if (!input) return;
        if (field.type === 'checkbox') { payload[field.name] = input.checked; return; }
        if (input.value === '') return;
        if (field.type === 'number') payload[field.name] = Number(input.value);
        else if (field.type === 'select' && field.relation) payload[field.name] = Number(input.value);
        else payload[field.name] = input.value;
    });
    return payload;
}

export function readActionPayload(form, fields) {
    return readResourcePayload(form, { fields });
}
