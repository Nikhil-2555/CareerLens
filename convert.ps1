$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Open("g:\project\AI Resume\CareerLens_Production_Docs.docx")
$doc.SaveAs("g:\project\AI Resume\CareerLens_Production_Docs.txt", 2)
$doc.Close()
$word.Quit()
