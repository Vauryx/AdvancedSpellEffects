import ASESettings from "./apps/aseSettings.js";
import { versionMigration } from "./versionMigration.js"
import * as utilFunctions from "./utilityFunctions.js";

Hooks.once('init', async function () {
  console.log("Registering ASE game settings...");
  const debouncedReload = foundry.utils.debounce(() => { window.location.reload(); }, 100);
  game.settings.register("advancedspelleffects", "overrideGridHighlight", {
    name: "Enable ASE Grid Highlight Override",
    hint: "This overrides the foundry default template behaviour and removes the grid highlighting for templates specifically placed by ASE spells. Other templates should function as normal.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: debouncedReload
  });
  game.settings.register("advancedspelleffects", "overrideTemplateBorder", {
    name: "Enable ASE Template Border Override",
    hint: "This overrides the foundry default template behaviour and removes the border for templates specifically placed by ASE spells. Other templates should function as normal.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: debouncedReload
  });
  game.settings.register("advancedspelleffects", "playerAllowSettings", {
    name: "Enable ASE settings for player",
    hint: "Enable the settings window for player. World must be reload.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    onChange: debouncedReload
  });
});

Hooks.once('ready', async function () {
  if (game.settings.get("advancedspelleffects", "overrideGridHighlight")) {
    libWrapper.register('advancedspelleffects', "MeasuredTemplate.prototype.highlightGrid", _ASEGridHighlightWrapper, "WRAPPER");
    utilFunctions.cleanUpTemplateGridHighlights();
  }
  if (game.settings.get("advancedspelleffects", "overrideTemplateBorder")) {
    if (!game.modules.get("tokenmagic")?.active) {
      libWrapper.register("advancedspelleffects", "MeasuredTemplate.prototype.render", _ASERemoveTemplateBorder, "WRAPPER");
    } else {
      ui.notifications.info("ASE Template Border Override disabled due to conflict with TokenMagicFX Module");
    }
  }

  function _ASERemoveTemplateBorder(wrapped, ...args) {
    wrapped(...args);
    if (this.document?.flags?.advancedspelleffects) {
      if (this.document?.flags?.advancedspelleffects?.placed) {
        this.template.alpha = 0;
      } else {
        return;
      }
    }
  }

  function _ASEGridHighlightWrapper(wrapped, ...args) {
    wrapped(...args);
    if (!this.document?.flags?.advancedspelleffects) return;
    const highlight = canvas.grid.getHighlightLayer(`Template.${this.id}`);
    if (highlight) {
      highlight.clear();
    }
  }

  if (!game.settings.get("advancedspelleffects", "playerAllowSettings") && !game.user.isGM) return;

  Hooks.on(`renderItemSheet5e`, async (app, html, data) => {
    //console.log("ASE: Caught actor sheet render hook!", data);
    //console.log('ASE Spell List: ', aseSpellList);
    if (app.document.getFlag("advancedspelleffects", "disableSettings")) {
      return;
    }
    const aseBtn = $(`<a class="ase-item-settings" title="Advanced Spell Effects"><i class="fas fa-magic"></i>ASE</a>`);
    aseBtn.click(async (ev) => {
      await versionMigration.handle(app.document);
      new ASESettings(app.document, {}).render(true);
    });
    html.closest('.app').find('.ase-item-settings').remove();
    let titleElement = html.closest('.app').find('.window-title');
    aseBtn.insertAfter(titleElement);
  });
});

