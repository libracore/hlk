frappe.ui.form.on('Sales Invoice', {
	validate(frm) {
		if (cur_frm.doc.special_discounts) {
		    var discounts = cur_frm.doc.special_discounts;
			var total_discounts = 0;
			discounts.forEach(function(entry) {
				total_discounts += entry.discount;
			});
			if (!cur_frm.doc.apply_discount_on) {
				cur_frm.set_value('apply_discount_on', 'Net Total');
			}
			cur_frm.set_value('discount_amount', total_discounts);
		}
		
		validate_hlk_element_allocation(frm);
	},
	refresh(frm) {
		frm.fields_dict['hlk_structur_organisation'].grid.get_field('main_element').get_query = function(doc, cdt, cdn) {
			return {    
				filters:[
					['item_group', 'IN', ["Strukturelement", "Total-Element"]]
				]
			}
		};
		
		frm.fields_dict['hlk_structur_organisation'].grid.get_field('parent_element').get_query = function(doc, cdt, cdn) {
			return {    
				filters:[
					['item_group', 'IN', ["Strukturelement", "Total-Element"]]
				]
			}
		};
		
		frm.fields_dict['items'].grid.get_field('strukturelement').get_query = function(doc, cdt, cdn) {
			return {    
				filters:[
					['item_group', '=', "Strukturelement"]
				]
			}
		};
		
		cur_frm.fields_dict['introduction_template'].get_query = function(doc) {
			 return {
				 filters: {
					 "sales_invoice": 1,
					 "introduction": 1
				 }
			 }
		};
		
		cur_frm.fields_dict['closing_text_template'].get_query = function(doc) {
			 return {
				 filters: {
					 "sales_invoice": 1,
					 "closing_text": 1
				 }
			 }
		};
		
		if (!frm.doc.__islocal && cur_frm.doc.docstatus != '1') {
			frm.add_custom_button(__("Transfer Discounts"), function() {
				if (cur_frm.is_dirty()) {
					frappe.msgprint(__("Please save Document first."));
				} else {
					transfer_structur_organisation_discounts(frm);
				}
			}, __("HLK Tools"));
			
			frm.add_custom_button(__("Calc Totals"), function() {
				if (cur_frm.is_dirty()) {
					frappe.msgprint(__("Please save Document first."));
				} else {
					calc_structur_organisation_totals(frm);
				}
			}, __("HLK Tools"));
		}
	}
})

function validate_hlk_element_allocation(frm) {
	frappe.call({
		"method": "hlk.utils.validate_hlk_element_allocation",
		"async": false,
		"callback": function(response) {
			if (response.message == 'validate') {
				var hlk_element_allocation = check_hlk_element_allocation(frm);
				if (hlk_element_allocation != '') {
					frappe.msgprint( __("Zuweisungen Strukturelemente unvollständig, prüfen Sie folgende Artikelpositionen:") + hlk_element_allocation, __("Validation") );
					frappe.validated=false;
				}
			}
		}
	});
}

function calc_structur_organisation_totals(frm) {
	if (!frm.doc.__islocal) {
		frappe.call({
			"method": "hlk.utils.calc_structur_organisation_totals",
			"args": {
				"dt": "Sales Invoice",
				"dn": frm.doc.name
			},
			"async": false,
			"callback": function(response) {
				cur_frm.reload_doc();
			}
		});
	}
}

function transfer_structur_organisation_discounts(frm) {
	if (!frm.doc.__islocal) {
		frappe.call({
			"method": "hlk.utils.transfer_structur_organisation_discounts",
			"args": {
				"dt": "Sales Invoice",
				"dn": frm.doc.name
			},
			"async": false,
			"callback": function(response) {
				calc_structur_organisation_totals(frm);
			}
		});
	}
}

function check_hlk_element_allocation(frm) {
	var feedback = '';
	var items = cur_frm.doc.items;
	items.forEach(function(item_entry) {
		if (item_entry.hlk_element == null) {
			feedback = feedback + '<br>#' + String(item_entry.idx);
		}
	});
	return feedback
}