/*
 *  Copyright 2021 Collate
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { searchEntity } from '../../common/common';
import { DELETE_ENTITY, DELETE_TERM } from '../../constants/constants';

describe('Entity Details Page', () => {
  beforeEach(() => {
    cy.goToHomePage();
  });

  const deleteEntity = (value) => {
    const singuler = value.entity.slice(0, -1);
    // search for the term and redirect to the respective entity tab
    searchEntity(value.term);
    cy.get(`[data-testid="${value.entity}-tab"]`).should('be.visible').click();
    cy.get(`[data-testid="${value.entity}-tab"]`)
      .should('be.visible')
      .should('have.class', 'active')
      .click();

    cy.wait(500);

    //Click on manage button
    cy.get('[data-testid="table-link"]').first().should('be.visible').click();

    cy.get('[data-testid="manage-button"]')
      .should('exist')
      .should('be.visible')
      .click();

    cy.wait(1000);
    // check for delete section and delete button is available or not
    // cy.get('[data-testid="danger-zone"]').scrollIntoView().should('be.visible');
    cy.get('[data-testid="delete-button-title"]')
      .should('be.visible')
      .click()
      .as('deleteBtn');

    cy.wait(1000);

    cy.get('[data-testid="hard-delete-option"]')
      .should('contain', `Permanently Delete ${singuler} “${value.term}”`)
      .should('be.visible')
      .as('permanentDelete');

    cy.get('@permanentDelete').should('be.visible').click();

    cy.get('[data-testid="confirm-button"]')
      .should('be.visible')
      .as('confirmBtn');

    cy.get('@confirmBtn').should('be.disabled');

    cy.get('[data-testid="discard-button"]')
      .should('be.visible')
      .as('discardBtn');

    cy.get('[data-testid="confirmation-text-input"]')
      .should('be.visible')
      .as('textBox');

    // delete modal should be disappeared
    cy.get('@discardBtn').click();

    cy.get('[data-testid="manage-button"]')
      .should('exist')
      .should('be.visible')
      .click();

    // open modal and type required text in input box to delete entity

    cy.get('@deleteBtn').click();
    cy.wait(1000);
    cy.get('@permanentDelete').click();
    cy.get('@textBox').type(DELETE_TERM);
    cy.get('@confirmBtn').should('not.be.disabled');
    cy.get('@confirmBtn').click();

    // success modal should be visible
    cy.contains('deleted successfully!').should('be.visible');
    cy.get('.Toastify__close-button > svg')
      .first()
      .should('be.visible')
      .click();

    cy.get('[data-testid="message-container"]')
      .first()
      .scrollIntoView()
      .contains(`Deleted ${singuler}`)
      .should('be.visible');

    // data not found should be visible while redirecting to the deleted entity details page
    cy.get(`[title="${value.term}"]`).should('be.visible').click();
    cy.location('pathname').then((loc) => {
      const fqn = loc.split('/').pop();
      cy.get('.Toastify__toast-body > :nth-child(2)')
        .should('be.visible')
        .should('contain', `${singuler} instance for ${fqn} not found`);

      cy.get('.Toastify__close-button > svg')
        .first()
        .should('be.visible')
        .click();
      cy.get('[data-testid="no-data-image"]').should('be.visible');
      cy.contains(
        `${Cypress._.startCase(singuler)} instance for ${fqn} not found`
      ).should('be.visible');
    });
    cy.clickOnLogo();
  };

  const addOwnerAndTier = (value) => {
    searchEntity(value.term);
    cy.get(`[data-testid="${value.entity}-tab"]`).should('be.visible').click();
    cy.get(`[data-testid="${value.entity}-tab"]`)
      .should('be.visible')
      .should('have.class', 'active')
      .click();

    cy.get('[data-testid="table-link"]').first().should('be.visible').click();

    cy.wait(500);

    cy.get('[data-testid="edit-Owner-icon"]').should('be.visible').click();

    cy.wait(500);
    //Clicking on users tab
    cy.get('[data-testid="dropdown-tab"]')
      .contains('Users')
      .should('exist')
      .should('be.visible')
      .click();

    //Selecting the user
    cy.get('[data-testid="list-item"]')
      .should('exist')
      .should('be.visible')
      .click();
    cy.wait(1000);

    cy.get('[data-testid="owner-dropdown"]')
      .invoke('text')
      .then((text) => {
        expect(text).equal('Aaron Johnson');
      });

    cy.wait(1000);

    cy.get('[data-testid="edit-Tier-icon"]')
      .scrollIntoView()
      .should('exist')
      .should('be.visible')
      .click();

    cy.get('[data-testid="select-tier-buuton"]')
      .first()
      .should('exist')
      .should('be.visible')
      .click();

    cy.get('[data-testid="tier-dropdown"]')
      .invoke('text')
      .then((text) => {
        expect(text).equal('Tier1');
      });

    cy.get('[data-testid="entity-tags"]').should('contain', 'Tier1');
    cy.wait(1000);

    cy.clickOnLogo();

    // checks newly generated feed for follow and setting owner
    cy.get('[data-testid="message-container"]')
      .eq(1)
      .contains('Added owner: Aaron Johnson')
      .should('be.visible');

    cy.get('[data-testid="message-container"]')
      .eq(0)
      .scrollIntoView()
      .contains('Added tags: Tier.Tier1')
      .should('be.visible');

    cy.clickOnLogo();
  };

  it('Add Owner and Tier for entity', () => {
    Object.values(DELETE_ENTITY).forEach((value) => {
      addOwnerAndTier(value);
    });
  });

  it('Delete entity flow should work properly', () => {
    Object.values(DELETE_ENTITY).forEach((value) => {
      deleteEntity(value);
    });
  });
});
