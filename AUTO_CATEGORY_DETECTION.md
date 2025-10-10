# Auto-Category Detection for GPT Apps

Odin now automatically suggests categories for your ChatGPT apps using keyword matching! 🔍

## How It Works

When connecting a new GPT app, Odin analyzes your app's name and description using keyword matching to suggest the most appropriate category.

### Features

✅ **Keyword-Based Detection** - Fast, accurate categorization using pattern matching
✅ **Optional Description** - Provide details about your app for better accuracy
✅ **Manual Override** - Always keep control - edit the suggested category
✅ **No API Costs** - 100% free, runs on your server
✅ **Instant Results** - No external API calls needed

## Supported Categories

Based on OpenAI's official GPT categories:

| Category | Description | Keywords Detected |
|----------|-------------|-------------------|
| **Writing** | Creative writing, copywriting, content creation | write, content, blog, article, copy, essay, story |
| **Productivity** | Task management, organization, workflows | task, todo, organize, schedule, workflow, planner |
| **Research & Analysis** | Research tools, data analysis | research, analysis, data, insights, study, report |
| **Education** | Learning, teaching, tutoring | education, learn, teach, tutor, course, lesson |
| **Lifestyle** | Health, fitness, cooking, travel | health, fitness, cooking, recipe, travel, wellness |
| **DALL·E** | Image generation, visual content | dalle, image, picture, visual, art, design |
| **Programming** | Code generation, debugging | code, programming, developer, debug, api, script |
| **Other** | Anything that doesn't fit above | Default fallback |

## Usage Example

**Travel App:**
```
Name: "Travel Buddy"
Description: "Helps plan trips and find hotels"
✅ Detected: "lifestyle" (keywords: travel, trip)
Confidence: Medium
```

**Coding Assistant:**
```
Name: "Code Helper"
Description: "Debug Python code and write functions"
✅ Detected: "programming" (keywords: code, debug, functions)
Confidence: High
```

**Blog Writer:**
```
Name: "Content Creator"
Description: "Write blog posts and articles"
✅ Detected: "writing" (keywords: write, blog, articles, content)
Confidence: High
```

## How Detection Works

1. **Combine Text**: Merges app name + description
2. **Match Keywords**: Searches for category-specific keywords
3. **Score Categories**: Each keyword match adds +1 to category score
4. **Pick Best**: Category with highest score wins
5. **Set Confidence**:
   - High: 3+ keyword matches
   - Medium: 2 keyword matches
   - Low: 1 keyword match
   - Default to "other" if no matches

## UI Features

### Auto-Detect Button
- Click "✨ Auto-detect category" after entering name/description
- Shows loading spinner while analyzing
- Updates category dropdown automatically

### AI Suggestion Banner
- Green banner shows detection reasoning
- Example: "Detected keywords related to programming"
- Appears after successful detection

### Manual Override
- Category dropdown always editable
- Change anytime before or after detection
- Your choice is final

## Tips for Best Results

### ✅ Good Descriptions
```
"Helps users write blog posts and marketing copy"
→ Clearly detects: writing

"Debug Python code and generate API functions"
→ Clearly detects: programming

"Plan meals and create shopping lists"
→ Clearly detects: lifestyle
```

### ⚠️ Vague Descriptions
```
"Useful tool for everyone"
→ Might detect: other (no specific keywords)

"My app"
→ Might detect: other (too vague)
```

**Tip**: Include action words (write, code, plan, teach, analyze)

## Customizing Keywords

Want to add more keywords or adjust detection logic? Edit:

```typescript
// app/api/detect-category/route.ts

const categoryRules = [
  {
    category: 'writing',
    keywords: ['write', 'writing', 'content', ...], // Add your keywords
    weight: 1
  },
  // ...
];
```

You can:
- Add more keywords to existing categories
- Adjust keyword weights for prioritization
- Add custom logic for special cases
- Change confidence thresholds

## FAQ

**Q: How accurate is keyword detection?**
A: Very accurate for clear, descriptive names/descriptions. Less accurate for vague inputs.

**Q: Can I manually select a category?**
A: Yes! The dropdown is always editable. Auto-detection is just a suggestion.

**Q: Will my existing apps be affected?**
A: No, this only affects new app connections. Existing apps keep their categories.

**Q: What if no keywords match?**
A: It defaults to "other" and you can manually select the correct category.

**Q: Is this free?**
A: Yes! 100% free with no API costs. Runs entirely on your server.

**Q: Can I disable auto-detection?**
A: Just don't click the "Auto-detect" button. You can always select manually.

**Q: Does it work offline?**
A: Yes! No external APIs needed - everything runs on your Vercel server.

## Troubleshooting

### "Auto-detect category" button is disabled
**Cause**: No name or description provided
**Solution**: Enter at least an app name

### Detection returns "other"
**Cause**: No matching keywords found
**Solution**: Add more descriptive text or manually select category

### Wrong category detected
**Solution**: Click the dropdown and select the correct one

## Privacy

✅ **No Data Sent Externally** - Everything runs on your server
✅ **No API Calls** - Pure JavaScript logic
✅ **No Tracking** - Only you see your app details

## Next Steps

1. ✅ Go to `/dashboard/apps`
2. ✅ Click "Connect App"
3. ✅ Enter name and description
4. ✅ Click "✨ Auto-detect category"
5. ✅ Review and override if needed
6. ✅ Click "Connect App"

Enjoy automated categorization - completely free! 🎉
