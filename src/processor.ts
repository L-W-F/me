/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module markdown-gfm/gfmdataprocessor
 */

import { markdown2fragment } from './markdown2fragment';
import { fragment2markdown } from './fragment2markdown';

/**
 * This data processor implementation uses GitHub Flavored Markdown as input/output data.
 *
 * See the {@glink features/markdown Markdown output} guide to learn more on how to enable it.
 *
 * @implements module:engine/dataprocessor/dataprocessor~DataProcessor
 */
export class GFMDataProcessor {
  /**
   * Creates a new instance of the Markdown data processor class.
   *
   * @param {module:engine/view/document~Document} document
   */
  constructor(document) {
    this.document = document;
  }

  /**
   * Converts the provided Markdown string to a view tree.
   *
   * @param {String} data A Markdown string.
   * @returns {module:engine/view/documentfragment~DocumentFragment} The converted view element.
   */
  toView(data) {
    return markdown2fragment(data, { document: this.document });
  }

  /**
   * Converts the provided {@link module:engine/view/documentfragment~DocumentFragment} to data format &mdash; in this
   * case to a Markdown string.
   *
   * @param {module:engine/view/documentfragment~DocumentFragment} viewFragment
   * @returns {String} Markdown string.
   */
  toData(viewFragment) {
    return fragment2markdown(viewFragment, { document: this.document });
  }

  /**
   * Registers a {@link module:engine/view/matcher~MatcherPattern} for view elements whose content should be treated as raw data
   * and not processed during the conversion from Markdown to view elements.
   *
   * The raw data can be later accessed by a
   * {@link module:engine/view/element~Element#getCustomProperty custom property of a view element} called `"$rawContent"`.
   *
   * @param {module:engine/view/matcher~MatcherPattern} pattern The pattern matching all view elements whose content should
   * be treated as raw data.
   */
  registerRawContentMatcher(/* pattern */) {}

  /**
   * This method does not have any effect on the data processor result. It exists for compatibility with the
   * {@link module:engine/dataprocessor/dataprocessor~DataProcessor `DataProcessor` interface}.
   */
  useFillerType() {}
}
