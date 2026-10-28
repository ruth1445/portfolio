# thoughtopsy research report viewer

This viewer follows the existing Monosemanticity report-zine pattern. It displays
the **original compiled PDF**, retaining its LaTeX layout, fonts, equations and
pagination. The reader is not a recreation of the paper.

## One-time asset sync (on the author's Mac)

The PDF binary cannot be uploaded through the text-only GitHub editing connector.
After re-compiling the latest paper in the private pds-journal-paper worktree, copy
the exact reviewed PDF into this directory:

    thoughtopsy-report/thoughtopsy_research.pdf

Before making the portfolio PR public on GitHub Pages, explicitly check the PDF
for personal original journal excerpts, other people's names, private source
identifiers, URLs and accidental identifying data. The paper is exploratory and
must not claim verified psychological growth or forecast accuracy.

Once the reviewed PDF is in place, the viewer at /thoughtopsy-report/ renders it
page-by-page using the unchanged PDF bytes, with a full PDF link. Do not merge the
portfolio feature branch before the PDF exists and a reviewer has opened its pages.

This public repo must never contain raw original journal files, the private
pds-journal Git history, unredacted supporting evidence or user feedback files.
