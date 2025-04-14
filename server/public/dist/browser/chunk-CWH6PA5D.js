import{A as b,a as n,b as u,cb as Q,e as h,g as r,i as d,m as g,x as z}from"./chunk-CLOBPWEO.js";var x=(()=>{class a{constructor(s){this.dataService=s,this.logoColors=["DarkCyan","Moccasin","BurlyWood","Khaki","Silver","DarkGrey","CadetBlue","Grey"],this.categoryColors=["BurlyWood","LightBlue","Thistle","LightSteelBlue","Silver"],this.categoryImages=["bullseye-gradient.png","liquid-cheese.png","sun-tornado.png","radiant-gradient.png","slanted-gradient.png"],this.categoriesColorMap=new Map,this.quizzesColorMap=new Map,this.quizzes=[],this.quizzesSubject=new r([]),this.quizCategories=[],this.quizCategoriesSubject=new r([]),this.quizQuestions=[],this.quizQuestionsSubject=new r([]),this.assignedQuestions=[],this.assignedQuestionsSubject=new r([]),this.quizResults=[],this.quizResultsSubject=new r([]),g({categoriesResponse:this.dataService.getCategories(),quizzesResponse:this.dataService.getQuizzes()}).subscribe({next:({categoriesResponse:e,quizzesResponse:i})=>{let t=e.categories;console.log("Categories: ",t),e.status==="OK"&&(this.quizCategories=t,this.quizCategories.forEach(o=>{o=this.assignCategoryColor(o)}),this.quizCategoriesSubject.next([...this.quizCategories]));let c=i.quizzes;console.log("Quizzes: ",c),i.status==="OK"&&(this.quizzes=c,this.quizzes.forEach(o=>{let q=this.quizCategories.find(l=>l.id===o.categoryId);if(o.categoryName=q?.name,!this.quizzesColorMap.has(o.id)){let l=this.logoColors[Math.floor(Math.random()*this.logoColors.length)];o.color=l}}),this.quizzesSubject.next([...this.quizzes]))},error:e=>{console.error(e)}}),this.dataService.getQuizResults().subscribe({next:e=>{console.log("Quiz results: ",e),e.status==="OK"&&(this.quizResults=e.quizResults,this.quizResultsSubject.next([...this.quizResults]))},error:e=>{console.error(e)}}),this.dataService.getQuestions().subscribe({next:e=>{console.log("Questions: ",e),e.status==="OK"&&(this.quizQuestions=e.questions,this.quizQuestionsSubject.next([...this.quizQuestions]))},error:e=>{console.error(e)}}),this.dataService.getAssignedQuestions().subscribe({next:e=>{console.log("Assigned questions: ",e),e.status==="OK"&&(this.assignedQuestions=e.assignedQuestions,this.assignedQuestionsSubject.next([...this.assignedQuestions]))},error:e=>{console.error(e)}})}getQuizzes(){return this.quizzesSubject}getQuiz(s){return this.quizzesSubject.asObservable().pipe(d(e=>e.find(i=>i.id===s)||null))}addQuiz(s){return this.dataService.addQuiz(s).pipe(d(e=>{if(console.log("Added: ",e),e.status==="OK"&&e.insertId){let i=this.quizCategories.find(t=>t.id===s.categoryId);return s.categoryName=i?.name,this.quizzes.push(u(n({},s),{id:e.insertId})),this.quizzesSubject.next([...this.quizzes]),e.insertId}else throw new Error("Failed to add quiz")}))}editQuiz(s){return this.dataService.editQuiz(s).pipe(d(e=>{if(console.log("Edited: ",e),e.status==="OK"){let i=this.quizCategories.find(t=>t.id===s.categoryId);return s.categoryName=i?.name,this.quizzes[this.quizzes.findIndex(t=>t.id==s.id)]=s,this.quizzesSubject.next([...this.quizzes]),"OK"}else throw new Error("Failed to add quiz")}))}deleteQuiz(s){this.dataService.deleteQuiz(s).subscribe({next:e=>{console.log(e),e.status==="OK"&&(this.quizzes.splice(this.quizzes.findIndex(i=>i.id==s),1),this.quizzesSubject.next([...this.quizzes]))},error:e=>{console.log(e)}})}getQuizCategories(){return this.quizCategoriesSubject}getQuizCategory(s){return this.quizCategoriesSubject.asObservable().pipe(d(e=>e.find(i=>i.id===s)||null))}addCategory(s){console.log(s),this.dataService.addCategory(s).subscribe({next:e=>{console.log("Added: ",e),e.status==="OK"&&(s=this.assignCategoryColor(u(n({},s),{id:e.insertId})),this.quizCategories.push(s),this.quizCategoriesSubject.next([...this.quizCategories]))},error:e=>{console.log(e)}})}editCategory(s){this.dataService.editCategory(s).subscribe({next:e=>{console.log("Edited: ",e),e.status==="OK"&&(this.quizCategories[this.quizCategories.findIndex(i=>i.id==s.id)]=s,this.quizCategoriesSubject.next([...this.quizCategories]))},error:e=>{console.log(e)}})}deleteCategory(s){this.dataService.deleteCategory(s).subscribe({next:e=>{console.log(e),e.status==="OK"&&(this.quizCategories.splice(this.quizCategories.findIndex(i=>i.id==s),1),this.quizCategoriesSubject.next([...this.quizCategories]))},error:e=>{console.log(e)}})}getAllQuestions(){return this.quizQuestionsSubject}addQuestion(s){return console.log(s),new h(e=>{this.dataService.addQuestion(s).subscribe({next:i=>{if(console.log("Added: ",i),i.status==="OK"){let t=u(n({},s),{id:i.insertId});this.quizQuestions.push(t),this.quizQuestionsSubject.next([...this.quizQuestions]),e.next(t),e.complete()}},error:i=>{console.log(i),e.error(i)}})})}editQuestion(s){this.dataService.editQuestion(s).subscribe({next:e=>{console.log("Edited: ",e),e.status==="OK"&&(this.quizQuestions[this.quizQuestions.findIndex(i=>i.id==s.id)]=s,this.quizQuestionsSubject.next([...this.quizQuestions]))},error:e=>{console.log(e)}})}deleteQuestion(s){this.dataService.deleteQuestion(s).subscribe({next:e=>{console.log(e),e.status==="OK"&&(this.quizQuestions.splice(this.quizQuestions.findIndex(i=>i.id==s),1),this.quizQuestionsSubject.next([...this.quizQuestions]))},error:e=>{console.log(e)}})}getAssignedQuestions(){return this.assignedQuestionsSubject}addAssignedQuestion(s){console.log(s),this.dataService.addAssignedQuestion(s).subscribe({next:e=>{console.log("Added: ",e),e.status==="OK"&&(this.assignedQuestions.push(u(n({},s),{id:e.insertId})),this.assignedQuestionsSubject.next([...this.assignedQuestions]))},error:e=>{console.log(e)}})}editAssignedQuestion(s){this.dataService.editAssignedQuestion(s).subscribe({next:e=>{console.log("Edited: ",e),e.status==="OK"&&(this.assignedQuestions[this.assignedQuestions.findIndex(i=>i.id==s.id)]=s,this.assignedQuestionsSubject.next([...this.assignedQuestions]))},error:e=>{console.log(e)}})}deleteAssignedQuestion(s){this.dataService.deleteAssignedQuestion(s).subscribe({next:e=>{console.log(e),e.status==="OK"&&(this.assignedQuestions.splice(this.assignedQuestions.findIndex(i=>i.id==s),1),this.assignedQuestionsSubject.next([...this.assignedQuestions]))},error:e=>{console.log(e)}})}addQuizResults(s){console.log(s),this.dataService.addQuizResult(s).subscribe({next:e=>{console.log("Added: ",e),e.status==="OK"&&(this.quizResults.push(u(n({},s),{id:e.insertId})),this.quizResultsSubject.next([...this.quizResults]))},error:e=>{console.error(e)}})}getQuizResults(){return this.quizResultsSubject}assignCategoryColor(s){if(this.categoriesColorMap.has(s.id))s.color=this.categoriesColorMap.get(s.id)?.color,s.image=this.categoriesColorMap.get(s.id)?.image;else{let e=this.categoryColors[this.categoriesColorMap.size%this.categoryColors.length],i=this.categoryImages[this.categoriesColorMap.size%this.categoryImages.length];this.categoriesColorMap.set(s.id,{color:e,image:i}),s.color=e,s.image=i}return s}static{this.\u0275fac=function(e){return new(e||a)(b(Q))}}static{this.\u0275prov=z({token:a,factory:a.\u0275fac,providedIn:"root"})}}return a})();export{x as a};
