frappe.ui.form.on('Quotation', {
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
		
		calc_valid_to_date(frm);
		
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
		
		if (!frm.doc.__islocal) {
			frm.add_custom_button(__("Change Customer w/o impact on price"), function() {
				change_customer(frm);
			});
			
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
				"dt": "Quotation",
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
				"dt": "Quotation",
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

function calc_valid_to_date(frm) {
	frappe.call({
		"method": "hlk.utils.check_calc_valid_to_date",
		"async": false,
		"callback": function(response) {
			if (response.message != 'deactivated') {
				var start = cur_frm.doc.transaction_date;
				var months = parseInt(response.message);
				var new_valid_date = frappe.datetime.add_months(start, months);
				cur_frm.set_value('valid_till', new_valid_date);
			}
		}
	});
}

function change_customer(frm) {
	frappe.prompt([
		{'fieldname': 'customer', 'fieldtype': 'Link', 'label': __('New Customer'), 'reqd': 1, 'options': 'Customer'},
		{'fieldname': 'adress', 'fieldtype': 'Link', 'label': __('New Address'), 'reqd': 0, 'options': 'Address'},
		{'fieldname': 'contact', 'fieldtype': 'Link', 'label': __('New Customer'), 'reqd': 0, 'options': 'Contact'}
	],
	function(values){
		var args = {
			'dt': 'Quotation',
			'record': cur_frm.doc.name,
			'customer': values.customer
		}
		if (values.address) {
			args["address"] = values.address
		}
		if (values.contact) {
			args["contact"] = values.contact
		}
		frappe.call({
			"method": "erpnextswiss.scripts.crm_tools.change_customer_without_impact_on_price",
			"args": args,
			"async": false,
			"callback": function(response) {
				cur_frm.reload_doc();
			}
		});
	},
	__("Change Customer w/o impact on price"),
	__('Change')
	)
}